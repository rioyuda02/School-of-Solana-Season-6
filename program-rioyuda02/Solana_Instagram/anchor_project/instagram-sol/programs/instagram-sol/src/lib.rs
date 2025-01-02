use anchor_lang::prelude::*;

declare_id!("GztjNt5uJiR5kvNVjHnGzsaA8FHbDEeCRH5jB5vHkP7J");

#[program]
pub mod instagram_sol {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("SolanaInstagram: {}", ctx.program_id);
        Ok(())
    }

    pub fn initialize_user(
        ctx: Context<InitializeUser>,
        username: String,
    ) -> Result<()> {
        let user_profile = &mut ctx.accounts.user_profile;
        user_profile.authority = ctx.accounts.authority.key();
        user_profile.username = username;
        user_profile.post_count = 0;
        Ok(())
    }

    pub fn create_post(
        ctx: Context<CreatePost>,
        content_uri: String,
        description: String,
    ) -> Result<()> {
        require!(content_uri.len() <= 200, ErrorCode::ContentUriTooLong);
        require!(description.len() <= 500, ErrorCode::DescriptionTooLong);

        let post = &mut ctx.accounts.post;
        let user_profile = &mut ctx.accounts.user_profile;

        post.authority = ctx.accounts.authority.key();
        post.content_uri = content_uri;
        post.description = description;
        post.likes = 0;
        post.created_at = Clock::get()?.unix_timestamp;

        user_profile.post_count = user_profile.post_count.checked_add(1).unwrap();

        Ok(())
    }

    pub fn delete_post(ctx: Context<DeletePost>) -> Result<()> {
        // Decrement post count
        let user_profile = &mut ctx.accounts.user_profile;
        user_profile.post_count = user_profile.post_count.checked_sub(1).unwrap();
        Ok(())
    }

    pub fn like_post(ctx: Context<LikePost>) -> Result<()> {
        let post = &mut ctx.accounts.post;
        post.likes = post.likes.checked_add(1).unwrap();
        Ok(())
    }

    pub fn unlike_post(ctx: Context<UnlikePost>) -> Result<()> {
        let post = &mut ctx.accounts.post;
        post.likes = post.likes.checked_sub(1).unwrap();
        Ok(())
    }
}


#[derive(Accounts)]
pub struct Initialize {}

#[derive(Accounts)]
pub struct InitializeUser<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 20 + 8 + 8 + 8,
        seeds = [b"user-profile", authority.key().as_ref()],
        bump
    )]
    pub user_profile: Account<'info, UserProfile>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreatePost<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 200 + 500 + 8 + 8,
        seeds = [b"post", authority.key().as_ref(), user_profile.post_count.to_le_bytes().as_ref()],
        bump
    )]
    pub post: Account<'info, Post>,
    #[account(mut, has_one = authority)]
    pub user_profile: Account<'info, UserProfile>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DeletePost<'info> {
    #[account(mut, close = authority, has_one = authority)]
    pub post: Account<'info, Post>,
    #[account(mut, has_one = authority)]
    pub user_profile: Account<'info, UserProfile>,
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct LikePost<'info> {
    #[account(
        init,
        payer = authority,
        space = 8, 
        seeds = [b"like", post.key().as_ref(), authority.key().as_ref()],
        bump
    )]
    pub like_account: Account<'info, Like>,
    #[account(mut)]
    pub post: Account<'info, Post>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UnlikePost<'info> {
    #[account(
        mut,
        close = authority,
        seeds = [b"like", post.key().as_ref(), authority.key().as_ref()],
        bump
    )]
    pub like_account: Account<'info, Like>,
    #[account(mut)]
    pub post: Account<'info, Post>,
    #[account(mut)]
    pub authority: Signer<'info>,
}


#[account]
pub struct UserProfile {
    pub authority: Pubkey,
    pub username: String,
    pub post_count: u64,
}

#[account]
pub struct Post {
    pub authority: Pubkey,
    pub content_uri: String,
    pub description: String,
    pub likes: u64,
    pub created_at: i64,
}

#[account]
pub struct Like {}

#[error_code]
pub enum ErrorCode {
    #[msg("Username is too long")]
    UsernameTooLong,
    #[msg("Content URI is too long")]
    ContentUriTooLong,
    #[msg("Description is too long")]
    DescriptionTooLong,
}
