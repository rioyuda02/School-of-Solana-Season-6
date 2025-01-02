// The task is to add code everywhere where you find // TODO.or todo!()
// You have to finish the implementation of methods of on-chain Calculator.
// Once you complete the TODOs, make sure that you delete all `todo!()` macros and
// you can try to run the tests using `anchor test` command and start debugging ;-)

use anchor_lang::prelude::*;

declare_id!("ARmiAGe6oAEq5BKguHydD3zt2n5PkV2Q5PLA1McuMkJT");

#[program]
pub mod on_chain_calculator {
    use super::*;
    // ------------------------------------------------------------------------------------------------
    // Functions
    //
    /// Initialize the Calculator with the corresponding operands and the corresponding update authority.
    /// Update authority is important to ensure that only privileged persons can modify calculator data.
    pub fn init_calculator(ctx: Context<InitializeCalculator>, x: i32, y: i32) -> Result<()> {
        let calculator = &mut ctx.accounts.calculator;
        let update_authority = ctx.accounts.update_authority.key();

        calculator.x = x;
        calculator.y = y;
        calculator.update_authority = update_authority;

        Ok(())
    }

    /// Update Operand X
    pub fn update_x(ctx: Context<ChangeInternalState>, new_x: i32) -> Result<()> {
        let calculator = &mut ctx.accounts.calculator;
        calculator.x = new_x;
        Ok(())
    }
    /// Update Operand Y
    pub fn update_y(ctx: Context<ChangeInternalState>, new_y: i32) -> Result<()> {
        // TODO
        let calculator = &mut ctx.accounts.calculator;
        calculator.y = new_y;
        Ok(())
    }
    // TODO: Implement the `update_authority` function in the same manner as the update functions above.

    // HINT - function declaration can look like:
    pub fn update_authority(ctx: Context<ChangeInternalState>, new_authority: Pubkey) -> Result<()> {
        let calculator =&mut ctx.accounts.calculator;
        calculator.update_authority = new_authority;
        Ok(())
    }

    /// This function reads data from the Calculator Account and
    /// performs an addition operation. The result, as well as the operands,
    /// are then emitted in the logs. We can then subscribe to the logs off-chain
    /// to check the correctness of the operands and the result.
    pub fn addition(ctx: Context<Compute>) -> Result<()> {
        let calculator = &ctx.accounts.calculator;

        // TODO
        let operand_x: i32 = calculator.x;
        // TODO
        let operand_y: i32 = calculator.y;

        // TODO
        let result: Option<i32> = calculator.addition();

        // The code below will emit operands with the result into logs.
        // We then subscribe to the logs inside tests to verify if the Calculator works correctly.
        emit!(CalculatorEvent {
            x: operand_x,
            y: operand_y,
            result,
            // Don`t forget to update this in other functions
            op: Operation::Addition,
        });
        Ok(())
    }
    // TODO: Implement other Calculator functions in the same manner as the addition function above.
    // To pass tests, use function names as follows:
    // - `subtraction`
    pub fn subtraction(ctx: Context<Compute>) -> Result<()> {
        let calculator = &ctx.accounts.calculator;
        let operand_x: i32 = calculator.x;
        let operand_y: i32 = calculator.y;
        let result: Option<i32> = calculator.subtraction();

        emit!(CalculatorEvent {
            x: operand_x,
            y: operand_y,
            result,
            op: Operation::Subtraction,
        });
        Ok(())
    }
    // - `multiplication`
    pub fn multiplication(ctx: Context<Compute>) -> Result<()> {
        let calculator = &ctx.accounts.calculator;
        let operand_x: i32 = calculator.x;
        let operand_y: i32 = calculator.y;
        let result: Option<i32> = calculator.multiplication();

        emit!(CalculatorEvent {
            x: operand_x,
            y: operand_y,
            result,
            op: Operation::Multiplication,
        });
        Ok(())
    }
    // - `division`
    pub fn division(ctx: Context<Compute>) -> Result<()> {
        let calculator = &ctx.accounts.calculator;
        let operand_x: i32 = calculator.x;
        let operand_y: i32 = calculator.y;
        let result: Option<i32> = calculator.division();

        emit!(CalculatorEvent {
            x: operand_x,
            y: operand_y,
            result,
            op: Operation::Division,
        });
        Ok(())
    }

    // ------------------------------------------------------------------------------------------------
}

// ------------------------------------------------------------------------------------------------
// Contexts
//
// In order to specify which accounts (read or write) the program expects, we use Contexts. Each Context is
// a predefined struct that can be used within function declarations. This ensures that, for example,
// the `init_calculator` function expects accounts as defined inside the InitializeCalculator Context.
// Furthermore, the Anchor framework allows us to define additional information about the accounts inside the Context.
// For example, if we want to modify account data, we mark it as (mut). If we want to initialize the account,
// we mark it with `init` (using `init`, the account is automatically mutable), and much more.
#[derive(Accounts)]
pub struct InitializeCalculator<'info> {
    #[account(mut)]
    // mark account as mutable because it will pay fees for calculator initialization
    pub update_authority: Signer<'info>,
    #[account(
        init, // initialize account
        payer = update_authority, // who will pay for account initialization
        space = 8 + 4 + 4 + 32 // how much space we need for data
    )]
    pub calculator: Account<'info, Calculator>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ChangeInternalState<'info> {
    pub update_authority: Signer<'info>,
    // Using the 'has_one' constraint, we can verify that the authority
    // corresponds to the authority that was initialized
    // and eventually saved within the Calculator data inside `init_calculator` function
    #[account(mut,
        has_one = update_authority @ CalculatorError::WrongPrivileges
    )]
    pub calculator: Account<'info, Calculator>,
}

#[derive(Accounts)]
pub struct Compute<'info> {
    pub calculator: Account<'info, Calculator>,
}
// ------------------------------------------------------------------------------------------------
// Stored on-chain Data
//
#[account]
pub struct Calculator {
    pub x: i32,
    pub y: i32,
    pub update_authority: Pubkey,
}

impl Calculator {
    pub fn addition(&self) -> Option<i32> {
        self.x.checked_add(self.y)
    }
    pub fn subtraction(&self) -> Option<i32> {
        self.x.checked_sub(self.y)
    }
    pub fn multiplication(&self) -> Option<i32> {
        self.x.checked_mul(self.y)
    }
    pub fn division(&self) -> Option<i32> {
        self.x.checked_div(self.y)
    }
}
// ------------------------------------------------------------------------------------------------
// Error Codes
//
#[error_code]
pub enum CalculatorError {
    #[msg("You do not have sufficient privileges to updated the Calculator")]
    WrongPrivileges,
}
// ------------------------------------------------------------------------------------------------
// Predefined structure for emitting into logs
//
#[event]
pub struct CalculatorEvent {
    pub x: i32,
    pub y: i32,
    pub result: Option<i32>,
    pub op: Operation,
}
#[derive(AnchorSerialize, AnchorDeserialize)]
/// Enum that helps differentiate between performed operations emitted into logs.
pub enum Operation {
    Addition,
    Subtraction,
    Multiplication,
    Division,
}
// ------------------------------------------------------------------------------------------------
