use anchor_lang::prelude::*;

use crate::errors::TwitterError;
use crate::states::*;

pub fn add_reaction(ctx: Context<AddReactionContext>, reaction: ReactionType) -> Result<()> {
    let tweet = &mut ctx.accounts.tweet;
    let tweet_reaction = &mut ctx.accounts.tweet_reaction;

    // -------------------------------------------------------------------------------------------
    // TODO: The input parameter of this function is a reaction, which is of type enum ReactionType.
    // Based on this fact you should check what type of reaction we are getting and update
    // the number of likes and dislikes within the tweet Account accordingly. Return an error in
    // case of over/underflow. Finally save the reaction value to the tweet_reaction variable of
    // the Reaction data account.

    // HINT1: Try using pattern matching via the match keyword.
    // https://doc.rust-lang.org/rust-by-example/flow_control/match.html

    // HINT2: tweet.likes = tweet.likes.checked_add(1).ok_or(TwitterError::MaxLikesReached)?;
    // -------------------------------------------------------------------------------------------
    match reaction {
        ReactionType::Like => {
            tweet.likes = tweet.likes.checked_add(1).ok_or
            (TwitterError::MaxLikesReached)?;
        },
        ReactionType::Dislike => {
            tweet.dislikes = tweet.dislikes.checked_add(1).ok_or
            (TwitterError::MaxLikesReached)?;
        }
    }

    // TODO: Do not forget to update all values within the tweet_reaction Account.

    // HINT:
    // - reaction_author
    // - parent_tweet
    // - bump (check initialize_tweet for reference)
    // -------------------------------------------------------------------------------------------
    tweet_reaction.reaction = reaction;
    tweet_reaction.reaction_author = ctx.accounts.reaction_author.key();
    tweet_reaction.parent_tweet = tweet.key();
    tweet_reaction.bump = ctx.bumps.tweet_reaction;

    Ok(())
}
#[derive(Accounts)]
pub struct AddReactionContext<'info> {
    #[account(mut)]
    pub reaction_author: Signer<'info>,
    #[account(
        init,
        payer = reaction_author,
        space = 8 + Reaction::LEN,
        seeds = [
            TWEET_REACTION_SEED.as_bytes(),
            reaction_author.key().as_ref(),
            tweet.key().as_ref(),
            ],
        bump)]
    pub tweet_reaction: Account<'info, Reaction>,
    // -------------------------------------------------------------------------------------------
    // TODO: Fill the required account macro below - we want to check that a PDA account with correct
    // seeds and bump was submitted.

    // HINT:
    // - account must be mutable
    // - seeds are :    tweet.topic[..tweet.topic_length as usize].as_ref()
    //                  TWEET_SEED.as_bytes(),
    //                  tweet.tweet_author.key().as_ref()
    // - lastly, check the correctness of bump using: bump = tweet.bump
    // -------------------------------------------------------------------------------------------
    #[account(
        mut,
        seeds = [
            tweet.topic[..tweet.topic_length as usize].as_ref(),
            TWEET_SEED.as_bytes(),
            tweet.tweet_author.key().as_ref(),
        ],
        bump = tweet.bump
    )]
    pub tweet: Account<'info, Tweet>,
    pub system_program: Program<'info, System>,
}
