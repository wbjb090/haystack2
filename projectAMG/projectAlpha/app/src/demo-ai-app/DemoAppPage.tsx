import React, { useState } from "react";
import axios from "axios";
import Sentiment from "sentiment";
import { Button, Modal, Form, Spinner } from "react-bootstrap";
import { generateSalesMessage, postSalesMessage } from "./actions";

const Home: React.FC = () => {
  const [comments, setComments] = useState<
    { message: string; sentiment: number; id?: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [selectedComment, setSelectedComment] = useState<{
    message: string;
    id?: string;
  } | null>(null);
  const [showModal, setShowModal] = useState(false);

  const sentimentAnalyzer = new Sentiment();

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/retrieve-comments");
      const scoredComments = response.data.map(
        (comment: { message: string; id?: string }) => ({
          ...comment,
          sentiment: sentimentAnalyzer.analyze(comment.message).score,
        })
      );

      scoredComments.sort((a: { sentiment: number; }, b: { sentiment: number; }) => b.sentiment - a.sentiment); // Sort by sentiment score
      setComments(scoredComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      alert("Failed to fetch comments.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMessage = async (comment: { message: string }) => {
    setLoading(true);
    try {
      const message = await generateSalesMessage({ commentText: comment.message });
      setCustomMessage(message);
      setSelectedComment(comment);
      setShowModal(true);
    } catch (error) {
      console.error("Error generating sales message:", error);
      alert("Failed to generate the sales message.");
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!selectedComment || !selectedComment.id) {
      alert("No comment selected. Please try again.");
      console.error("Error: selectedComment is null or missing 'id'.", selectedComment);
      return;
    }

    if (!customMessage || customMessage.trim() === "") {
      alert("Message cannot be empty.");
      console.error("Error: customMessage is empty.");
      return;
    }

    try {
      await postSalesMessage({ message: customMessage, commentId: selectedComment.id });
      alert("Message posted successfully!");
      setShowModal(false); // Close the modal on success
    } catch (error: any) {
      console.error("Error posting comment:", error);
      alert(`Failed to post the comment. Error: ${error.message || "Unknown error"}`);
    }
  };

  return (
    <div>
      <h1>Social Comments Analyzer</h1>
      <Button onClick={fetchComments} disabled={loading}>
        {loading ? <Spinner animation="border" size="sm" /> : "Retrieve Comments"}
      </Button>

      {comments.length > 0 && (
        <div>
          <h2>Analyzed Comments</h2>
          <ul>
            {comments.map((comment, index) => (
              <li key={index}>
                <p>
                  <strong>Comment:</strong> {comment.message}
                </p>
                <p>
                  <strong>Sentiment Score:</strong> {comment.sentiment}
                </p>
                <Button onClick={() => handleGenerateMessage(comment)}>
                  Generate Sales Message
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Generated Sales Message</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="customMessage">
              <Form.Label>Sales Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handlePostComment}>
            Post Message
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Home;
