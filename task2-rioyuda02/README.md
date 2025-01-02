[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/5dqdmJnw)
![School of Solana](https://github.com/Ackee-Blockchain/school-of-solana/blob/master/.banner/banner.png?raw=true)

Welcome to **Task 2** of the **School of Solana Season 6**.

## 📚Task 2
The primary objective of this task is to introduce you to the Rust programming language. We'll explore fundamental Rust principles, including borrowing, objects, traits, mutability, and more. This part of the course is crucial because Rust is a key programming language in the Solana ecosystem. It's worth noting that Rust is sometimes compared to C++ and considered a competitor, making it valuable to learn.

The central concept of this task revolves around creating a calculator and implementing multiple shapes with corresponding functions to calculate properties like area and circumference. However, since this task serves as a gateway into the Solana world, it's essential that your calculator also handles potential overflow and underflow issues commonly encountered in arithmetic operations within Solana programs.

Regarding the Shapes, the goal is to familiarize yourself with Rust's concepts of structs, traits, and effectively applying object-oriented programming (OOP) principles in this language.

### Task details

In the **main.rs** file, let's go through the code structure:

- **Shape** Trait: You'll encounter a trait named **Shape**. This trait defines several functions related to properties of geometric shapes like **Rectangle** and **Circle**. The function names are mostly self-explanatory. Your job is to implement these functions for the respective **Geometric Objects**.

- **Geometric Objects**: Below the **Shape** trait, you'll find structures representing shapes, such as **Rectangle** and **Circle**. These structures have clear properties (e.g., Rectangle has sides a and b). Your task is to appropriately implement the Shape trait for these objects along with corresponding struct methods marked as **TODO**.

- **Calculator** Struct: Lastly, there's the **Calculator** struct, which contains two operands, x and y. When you create a Calculator instance, you'll perform mathematical operations on these operands. Your job is to implement these mathematical functions using the provided template. Additionally, it's essential to handle **underflow** and **overflow** correctly in your calculator, as these cases **are tested in the provided tests**.


### Submission Process
- Implement the necessary functions and logic in **main.rs**; they are marked as **TODO!**
- Use the provided tests in **tests.rs** to validate your code.
- Push your work.

### Deadline
The deadline for this task is **Wednesday, October 30th, at 23:59 UTC**.

>[!CAUTION]
>Note that we will not accept submissions after the deadline.

### Evaluation
>[!IMPORTANT]
>We will evaluate your submission using the same test suite provided in this task. Therefore, the requirements for this task are to pass **100%** of the provided tests.

>[!NOTE]
>Since floating-point comparisons can sometimes be cumbersome, your formula for calculating the area or circumference might be correct, but the tests may still fail due to floating-point precision issues. We will take such cases into consideration.

### Setup
For this Task you need to have [Rust Installed](https://www.rust-lang.org/tools/install). You don't need to worry about the installed version, as the specified Rust version inside rust-toolchain will handle that.

### Commands

1. To compile the project, run:
```
cargo build
```

2. To run the project and start the main function, use:
```
cargo run
```

3. To test your implementation, run:
```
cargo test
```

### Hints and Useful Links
[Primitive Type i64](https://doc.rust-lang.org/std/primitive.i64.html)

[Traits](https://doc.rust-lang.org/book/ch10-02-traits.html)

[References and Borrowing](https://doc.rust-lang.org/book/ch04-02-references-and-borrowing.html?highlight=borrow#references-and-borrowing)

[Structs](https://doc.rust-lang.org/book/ch05-01-defining-structs.html)

[Options](https://doc.rust-lang.org/std/option/)

-----

### Need help?
>[!TIP]
>If you have any questions, feel free to reach out to us on [Discord](https://discord.gg/z3JVuZyFnp).
