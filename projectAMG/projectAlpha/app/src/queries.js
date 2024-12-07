import { HttpError } from 'wasp/server'

export const getAnalyzedComments = async (args, context) => {
  if (!context.user) { throw new HttpError(401) }

  const comments = await context.entities.SocialMediaComment.findMany({
    where: {
      profile: {
        userId: context.user.id
      }
    },
    select: {
      id: true,
      content: true,
      sentiment: true
    }
  });

  // Filter comments based on positive sentiment indicating likelihood to purchase
  const potentialPurchaseComments = comments.filter(comment => comment.sentiment === 'positive');

  return potentialPurchaseComments;
}

export const getSuggestedMessages = async (args, context) => {
  if (!context.user) { throw new HttpError(401) }

  const suggestedMessages = await context.entities.SuggestedMessage.findMany({
    select: {
      id: true,
      content: true,
      comment: {
        select: {
          id: true,
          content: true,
          sentiment: true
        }
      }
    }
  });

  return suggestedMessages;
}