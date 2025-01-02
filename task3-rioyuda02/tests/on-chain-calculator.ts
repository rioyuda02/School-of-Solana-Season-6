import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { OnChainCalculator } from "../target/types/on_chain_calculator";
import { assert } from "chai";


enum Operation {
  Addition,
  Subtraction,
  Multiplication,
  Division
};

describe("on-chain-calculator", async () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.OnChainCalculator as Program<OnChainCalculator>;;



  const alice = anchor.web3.Keypair.generate();
  const bob = anchor.web3.Keypair.generate();
  const anatoly = anchor.web3.Keypair.generate();
  const calculator_alice = anchor.web3.Keypair.generate();
  const calculator_anatoly = anchor.web3.Keypair.generate();



  it("Initialize Calculator Alice", async () => {
    await airdrop(provider.connection, alice.publicKey);

    const operand_x = 9
    const operand_y = 9

    await program.methods.initCalculator(operand_x, operand_y).accounts({
      updateAuthority: alice.publicKey,
      calculator: calculator_alice.publicKey,
    }).signers([alice, calculator_alice]).rpc({ commitment: "confirmed" })

    const calculator_data = (await program.account.calculator.fetch(calculator_alice.publicKey));
    assert.strictEqual(calculator_data.updateAuthority.toString(), alice.publicKey.toString());
    assert.strictEqual(calculator_data.x, operand_x);
    assert.strictEqual(calculator_data.y, operand_y);

  })
  it("Initialize Calculator Anatoly", async () => {
    await airdrop(provider.connection, anatoly.publicKey);

    const operand_x = 9
    const operand_y = 9

    await program.methods.initCalculator(operand_x, operand_y).accounts({
      updateAuthority: anatoly.publicKey,
      calculator: calculator_anatoly.publicKey,
    }).signers([anatoly, calculator_anatoly]).rpc({ commitment: "confirmed" })

    const calculator_data = (await program.account.calculator.fetch(calculator_anatoly.publicKey));
    assert.strictEqual(calculator_data.updateAuthority.toString(), anatoly.publicKey.toString());
    assert.strictEqual(calculator_data.x, operand_x);
    assert.strictEqual(calculator_data.y, operand_y);

  })

  it("Update Y", async () => {
    const new_y = 3;
    const calculator_data_before = (await program.account.calculator.fetch(calculator_alice.publicKey));

    await program.methods.updateY(new_y).accounts({
      updateAuthority: alice.publicKey,
      calculator: calculator_alice.publicKey,
    }).signers([alice]).rpc({ commitment: "confirmed" })


    const calculator_data_after = (await program.account.calculator.fetch(calculator_alice.publicKey));
    assert.strictEqual(calculator_data_after.y, new_y);
    assert.strictEqual(calculator_data_after.updateAuthority.toString(), calculator_data_before.updateAuthority.toString());

  })

  it("Do Addition", async () => {
    const calculator_data = (await program.account.calculator.fetch(calculator_alice.publicKey));

    let tx_sig = await program.methods.addition().accounts({
      calculator: calculator_alice.publicKey,
    }).rpc({ commitment: "confirmed" })

    const tx = await provider.connection.getParsedTransaction(tx_sig, "confirmed")
    const eventParser = new anchor.EventParser(program.programId, new anchor.BorshCoder(program.idl));
    const events = eventParser.parseLogs(tx.meta.logMessages);

    let logsEmitted = false
    for (let event of events) {
      logsEmitted = true;
      assert.strictEqual(calculator_data.x, event.data.x);
      assert.strictEqual(calculator_data.y, event.data.y);
      assert.strictEqual(calculator_data.x + calculator_data.y, event.data.result);
      assert.deepEqual({ addition: {} }, event.data.op);
    }
    assert.isTrue(logsEmitted);

  })

  it("Do Subtraction", async () => {

    const calculator_data = (await program.account.calculator.fetch(calculator_alice.publicKey));

    let tx_sig = await program.methods.subtraction().accounts({
      calculator: calculator_alice.publicKey,
    }).rpc({ commitment: "confirmed" })

    const tx = await provider.connection.getParsedTransaction(tx_sig, "confirmed")
    const eventParser = new anchor.EventParser(program.programId, new anchor.BorshCoder(program.idl));
    const events = eventParser.parseLogs(tx.meta.logMessages);

    let logsEmitted = false
    for (let event of events) {
      logsEmitted = true;
      assert.strictEqual(calculator_data.x, event.data.x);
      assert.strictEqual(calculator_data.y, event.data.y);
      assert.strictEqual(calculator_data.x - calculator_data.y, event.data.result);
      assert.deepEqual({ subtraction: {} }, event.data.op);

    }
    assert.isTrue(logsEmitted);
  })

  it("Do Multiplication", async () => {

    const calculator_data = (await program.account.calculator.fetch(calculator_alice.publicKey));

    let tx_sig = await program.methods.multiplication().accounts({
      calculator: calculator_alice.publicKey,
    }).rpc({ commitment: "confirmed" })

    const tx = await provider.connection.getParsedTransaction(tx_sig, "confirmed")
    const eventParser = new anchor.EventParser(program.programId, new anchor.BorshCoder(program.idl));
    const events = eventParser.parseLogs(tx.meta.logMessages);

    let logsEmitted = false
    for (let event of events) {
      logsEmitted = true;
      assert.strictEqual(calculator_data.x, event.data.x);
      assert.strictEqual(calculator_data.y, event.data.y);
      assert.strictEqual(calculator_data.x * calculator_data.y, event.data.result);
      assert.deepEqual({ multiplication: {} }, event.data.op);

    }
    assert.isTrue(logsEmitted);
  })
  it("Do Division", async () => {

    const calculator_data = (await program.account.calculator.fetch(calculator_alice.publicKey));

    let tx_sig = await program.methods.division().accounts({
      calculator: calculator_alice.publicKey,
    }).rpc({ commitment: "confirmed" })

    const tx = await provider.connection.getParsedTransaction(tx_sig, "confirmed")
    const eventParser = new anchor.EventParser(program.programId, new anchor.BorshCoder(program.idl));
    const events = eventParser.parseLogs(tx.meta.logMessages);

    let logsEmitted = false
    for (let event of events) {
      logsEmitted = true;
      assert.strictEqual(calculator_data.x, event.data.x);
      assert.strictEqual(calculator_data.y, event.data.y);
      assert.strictEqual(calculator_data.x / calculator_data.y, event.data.result);
      assert.deepEqual({ division: {} }, event.data.op);

    }
    assert.isTrue(logsEmitted);
  })

  it("Result is None if addition overflow occured", async () => {
    await program.methods.updateX(2 ** 31 - 1).accounts({
      updateAuthority: alice.publicKey,
      calculator: calculator_alice.publicKey,
    }).signers([alice]).rpc({ commitment: "confirmed" })

    await program.methods.updateY(2 ** 31 - 1).accounts({
      updateAuthority: alice.publicKey,
      calculator: calculator_alice.publicKey,
    }).signers([alice]).rpc({ commitment: "confirmed" })

    const calculator_data = (await program.account.calculator.fetch(calculator_alice.publicKey));

    let tx_sig = await program.methods.addition().accounts({
      calculator: calculator_alice.publicKey,
    }).rpc({ commitment: "confirmed" })

    const tx = await provider.connection.getParsedTransaction(tx_sig, "confirmed")
    const eventParser = new anchor.EventParser(program.programId, new anchor.BorshCoder(program.idl));
    const events = eventParser.parseLogs(tx.meta.logMessages);

    let logsEmitted = false
    for (let event of events) {
      logsEmitted = true;
      assert.strictEqual(calculator_data.x, event.data.x);
      assert.strictEqual(calculator_data.y, event.data.y);
      assert.isNull(event.data.result)
      assert.deepEqual({ addition: {} }, event.data.op);
    }
    assert.isTrue(logsEmitted);

  })

  it("Result is None if subtraction overflow occured", async () => {
    await program.methods.updateX(-(2 ** 31)).accounts({
      updateAuthority: alice.publicKey,
      calculator: calculator_alice.publicKey,
    }).signers([alice]).rpc({ commitment: "confirmed" })

    await program.methods.updateY(1).accounts({
      updateAuthority: alice.publicKey,
      calculator: calculator_alice.publicKey,
    }).signers([alice]).rpc({ commitment: "confirmed" })

    const calculator_data = (await program.account.calculator.fetch(calculator_alice.publicKey));

    let tx_sig = await program.methods.subtraction().accounts({
      calculator: calculator_alice.publicKey,
    }).rpc({ commitment: "confirmed" })

    const tx = await provider.connection.getParsedTransaction(tx_sig, "confirmed")
    const eventParser = new anchor.EventParser(program.programId, new anchor.BorshCoder(program.idl));
    const events = eventParser.parseLogs(tx.meta.logMessages);

    let logsEmitted = false
    for (let event of events) {
      logsEmitted = true;
      assert.strictEqual(calculator_data.x, event.data.x);
      assert.strictEqual(calculator_data.y, event.data.y);
      assert.isNull(event.data.result)
      assert.deepEqual({ subtraction: {} }, event.data.op);
    }
    assert.isTrue(logsEmitted);

  })

  it("Result is None if multiplication overflow occured", async () => {
    await program.methods.updateX(2 ** 31 - 1).accounts({
      updateAuthority: alice.publicKey,
      calculator: calculator_alice.publicKey,
    }).signers([alice]).rpc({ commitment: "confirmed" })

    await program.methods.updateY(2 ** 31 - 1).accounts({
      updateAuthority: alice.publicKey,
      calculator: calculator_alice.publicKey,
    }).signers([alice]).rpc({ commitment: "confirmed" })

    const calculator_data = (await program.account.calculator.fetch(calculator_alice.publicKey));

    let tx_sig = await program.methods.multiplication().accounts({
      calculator: calculator_alice.publicKey,
    }).rpc({ commitment: "confirmed" })

    const tx = await provider.connection.getParsedTransaction(tx_sig, "confirmed")
    const eventParser = new anchor.EventParser(program.programId, new anchor.BorshCoder(program.idl));
    const events = eventParser.parseLogs(tx.meta.logMessages);

    let logsEmitted = false
    for (let event of events) {
      logsEmitted = true;
      assert.strictEqual(calculator_data.x, event.data.x);
      assert.strictEqual(calculator_data.y, event.data.y);
      assert.isNull(event.data.result)
      assert.deepEqual({ multiplication: {} }, event.data.op);
    }
    assert.isTrue(logsEmitted);

  })

  it("Result is None if division by zero occured", async () => {
    await program.methods.updateX(2).accounts({
      updateAuthority: alice.publicKey,
      calculator: calculator_alice.publicKey,
    }).signers([alice]).rpc({ commitment: "confirmed" })

    await program.methods.updateY(0).accounts({
      updateAuthority: alice.publicKey,
      calculator: calculator_alice.publicKey,
    }).signers([alice]).rpc({ commitment: "confirmed" })

    const calculator_data = (await program.account.calculator.fetch(calculator_alice.publicKey));

    let tx_sig = await program.methods.division().accounts({
      calculator: calculator_alice.publicKey,
    }).rpc({ commitment: "confirmed" })

    const tx = await provider.connection.getParsedTransaction(tx_sig, "confirmed")
    const eventParser = new anchor.EventParser(program.programId, new anchor.BorshCoder(program.idl));
    const events = eventParser.parseLogs(tx.meta.logMessages);

    let logsEmitted = false
    for (let event of events) {
      logsEmitted = true;
      assert.strictEqual(calculator_data.x, event.data.x);
      assert.strictEqual(calculator_data.y, event.data.y);
      assert.isNull(event.data.result)
      assert.deepEqual({ division: {} }, event.data.op);
    }
    assert.isTrue(logsEmitted);

  })

  it("Cannot update X without the privileges", async () => {
    let flag = "This should fail"
    try {
      await program.methods.updateX(15).accounts({
        updateAuthority: bob.publicKey,
        calculator: calculator_alice.publicKey,
      }).signers([bob]).rpc({ commitment: "confirmed" })
    } catch (error) {
      flag = "Failed"
      const err = anchor.AnchorError.parse(error.logs);
      assert.strictEqual(err.error.errorCode.code, "WrongPrivileges");
    }
    assert.strictEqual(flag, "Failed");
  })

  it("Cannot update Y without the privileges", async () => {
    let flag = "This should fail"
    try {
      await program.methods.updateY(15).accounts({
        updateAuthority: bob.publicKey,
        calculator: calculator_alice.publicKey,
      }).signers([bob]).rpc({ commitment: "confirmed" })
    } catch (error) {
      flag = "Failed"
      const err = anchor.AnchorError.parse(error.logs);
      assert.strictEqual(err.error.errorCode.code, "WrongPrivileges");
    }
    assert.strictEqual(flag, "Failed");

  })
  it("Cannot update Authority without the privileges", async () => {
    const new_authority = bob;

    let flag = "This should fail"
    try {
      await program.methods.updateAuthority(new_authority.publicKey).accounts({
        updateAuthority: bob.publicKey,
        calculator: calculator_alice.publicKey,
      }).signers([bob]).rpc({ commitment: "confirmed" })
    } catch (error) {
      flag = "Failed"
      const err = anchor.AnchorError.parse(error.logs);
      assert.strictEqual(err.error.errorCode.code, "WrongPrivileges");
    }
    assert.strictEqual(flag, "Failed");

  })
  it("Update Authority", async () => {
    const new_author = anatoly;

    const calculator_data_before = (await program.account.calculator.fetch(calculator_alice.publicKey));

    await program.methods.updateAuthority(new_author.publicKey).accounts({
      updateAuthority: alice.publicKey,
      calculator: calculator_alice.publicKey,
    }).signers([alice]).rpc({ commitment: "confirmed" })


    const calculator_data_after = (await program.account.calculator.fetch(calculator_alice.publicKey));
    assert.strictEqual(calculator_data_after.updateAuthority.toString(), new_author.publicKey.toString());
    assert.strictEqual(calculator_data_after.updateAuthority.toString(), new_author.publicKey.toString());
    assert.strictEqual(calculator_data_after.x, calculator_data_before.x);
    assert.strictEqual(calculator_data_after.y, calculator_data_before.y);

  })
  it("Alice no more has privileges", async () => {
    let flag = "This should fail"
    try {
      await program.methods.updateY(15).accounts({
        updateAuthority: alice.publicKey,
        calculator: calculator_alice.publicKey,
      }).signers([alice]).rpc({ commitment: "confirmed" })
    } catch (error) {
      flag = "Failed"
      const err = anchor.AnchorError.parse(error.logs);
      assert.strictEqual(err.error.errorCode.code, "WrongPrivileges");
    }
    assert.strictEqual(flag, "Failed");
  })
  it("Update X with new Authority", async () => {
    const new_x = 459;
    const calculator_data_before = (await program.account.calculator.fetch(calculator_alice.publicKey));

    await program.methods.updateX(new_x).accounts({
      updateAuthority: anatoly.publicKey,
      calculator: calculator_alice.publicKey,
    }).signers([anatoly]).rpc({ commitment: "confirmed" })


    const calculator_data_after = (await program.account.calculator.fetch(calculator_alice.publicKey));
    assert.strictEqual(calculator_data_after.x, new_x);
    assert.strictEqual(calculator_data_after.y, calculator_data_before.y);
    assert.strictEqual(calculator_data_after.updateAuthority.toString(), calculator_data_before.updateAuthority.toString());

  })

  it("Update Y with new Authority", async () => {
    const new_y = 597;
    const calculator_data_before = (await program.account.calculator.fetch(calculator_alice.publicKey));

    await program.methods.updateY(new_y).accounts({
      updateAuthority: anatoly.publicKey,
      calculator: calculator_alice.publicKey,
    }).signers([anatoly]).rpc({ commitment: "confirmed" })


    const calculator_data_after = (await program.account.calculator.fetch(calculator_alice.publicKey));
    assert.strictEqual(calculator_data_after.y, new_y);
    assert.strictEqual(calculator_data_after.x, calculator_data_before.x);
    assert.strictEqual(calculator_data_after.updateAuthority.toString(), calculator_data_before.updateAuthority.toString());

  })

  it("Multiplication still works", async () => {

    const calculator_data = (await program.account.calculator.fetch(calculator_alice.publicKey));

    let tx_sig = await program.methods.multiplication().accounts({
      calculator: calculator_alice.publicKey,
    }).rpc({ commitment: "confirmed" })

    const tx = await provider.connection.getParsedTransaction(tx_sig, "confirmed")
    const eventParser = new anchor.EventParser(program.programId, new anchor.BorshCoder(program.idl));
    const events = eventParser.parseLogs(tx.meta.logMessages);

    let logsEmitted = false
    for (let event of events) {
      logsEmitted = true;
      assert.strictEqual(calculator_data.x, event.data.x);
      assert.strictEqual(calculator_data.y, event.data.y);
      assert.strictEqual(calculator_data.x * calculator_data.y, event.data.result);
      assert.deepEqual({ multiplication: {} }, event.data.op);

    }
    assert.isTrue(logsEmitted);
  })
  it("Anatoly has autority over both Calculators", async () => {
    const calculator_anatoly1_data = (await program.account.calculator.fetch(calculator_anatoly.publicKey));
    const calculator_anatoly2_data = (await program.account.calculator.fetch(calculator_alice.publicKey));


    assert.strictEqual(calculator_anatoly1_data.updateAuthority.toString(), calculator_anatoly2_data.updateAuthority.toString());
  })
});


async function airdrop(connection: any, address: any, amount = 1000000000) {
  await connection.confirmTransaction(await connection.requestAirdrop(address, amount), "confirmed");
}
