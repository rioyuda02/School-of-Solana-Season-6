// The task is to add code everywhere where you find // TODO.
// You have to finish the implementation of the methods of Calculator, Rectangle and Circle structs.
// The code does not compile yet, because some of the required methods are missing - you have to add them.
// Once you complete the TODOs, make sure that you delete all `todo!()` macros and
// you can try to run the tests using `cargo test` command and start debugging ;-)

#![allow(dead_code)]

use std::fmt;
mod tests;

// ------------------------------------------------------------------------------------------------
// Traits
//
/// Trait Shape defines basic shared methods for various shapes.
/// More information can be found here: https://doc.rust-lang.org/book/ch10-02-traits.html
pub trait Shape {
    fn area(&self) -> f64;
    fn circumference(&self) -> f64;
}
// ------------------------------------------------------------------------------------------------
// Structs
//
/// The struct Calculator stores two operands, can perform simple math operations,
/// and is also resilient to overflow and underflow.
pub struct Calculator {
    pub x: i64,
    pub y: i64,
}
/// The struct Rectangle stores both sides and can compute area and
/// circumference for itself.
pub struct Rectangle {
    a: f64,
    b: f64,
}
/// The struct Circle stores radius and can compute area and
/// circumference for itself.
pub struct Circle {
    r: f64,
}
// ------------------------------------------------------------------------------------------------
// Non-Trait implementations for Structs
//
impl Calculator {
    /// Constructor
    pub fn new(arg1: &i64, arg2: &i64) -> Self {
        Self { x: *arg1, y: *arg2 }
    }
    /// Addition with Underflow/Overflow Resilience
    pub fn addition(&self) -> Option<i64> {
        // TODO Implement addition of calculator's x and y values.
        // Notice the Option<i64> return type: https://doc.rust-lang.org/std/option/index.html
        // Return None in case of under/overflow.
        // Try to check the documentation of i64 type if you can
        // find some useful methods: https://doc.rust-lang.org/std/primitive.i64.html#implementations
        self.x.checked_add(self.y)
                
    }
    /// Subtraction with Underflow/Overflow Resilience
    pub fn subtraction(&self) -> Option<i64> {
        // TODO Implement subtraction of calculator's x and y values.
        // Return None in case of under/overflow.
        self.x.checked_sub(self.y)
    }
    /// Multiplication with Underflow/Overflow Resilience
    pub fn multiplication(&self) -> Option<i64> {
        // TODO Implement multiplication of calculator's x and y values.
        // Return None in case of under/overflow.
        self.x.checked_mul(self.y)
    }
    /// Division with Underflow/Overflow Resilience
    pub fn division(&self) -> Option<i64> {
        // TODO Implement division of calculator's x and y values.
        // Return None in case of division by zero.
        if self.y == 0 {
            None
        } else {
            self.x.checked_div(self.y)
        }
    }
}
impl Rectangle {
    /// Constructor
    pub fn try_new(arg1: &f64, arg2: &f64) -> Result<Self, &'static str> {
        if *arg1 >= 0.0 && *arg2 >= 0.0 {
            Ok(Self { a: *arg1, b: *arg2 })
        } else {
            Err("Rectangle sides must be greater or equal to zero!")
        }
    }
    /// Set side a
    pub fn set_a(&mut self, a: &f64) -> Result<(), &'static str> {
        // TODO Implement the setter method and set the field `a` of the Rectangle struct
        // Notice that the fields a and b of Rectangle struct are private and can be access only by Rectangles methods
        // If the parameter is greater or equal to zero, update it and return Ok(())
        // otherwise return an Err (similar to try_new method)
        if *a >= 0.0 {
            self.a = *a;
            Ok(())
        } else {
            Err("Rectangle sides must be greater or equal to zero!")
        }
    }
    /// Set side b
    pub fn set_b(&mut self, b: &f64) -> Result<(), &'static str> {
        // TODO Implement the setter method and set the field `b` of the Rectangle struct
        // Notice that the fields a and b of Rectangle struct are private and can be access only by Rectangles methods
        // If the parameter is greater or equal to zero, update it and return Ok(())
        // otherwise return an Err (similar to try_new method)
        if *b >= 0.0 {
            self.b = *b;
            Ok(())
        } else {
            Err("Rectangle sides must be greater or equal to zero!")
        }
    }
    /// Get for A
    pub fn get_a(&self) -> f64 {
        self.a
    }
    /// Get for B
    pub fn get_b(&self) -> f64 {
        self.b
    }
}
impl Circle {
    /// Constructor
    pub fn try_new(arg1: &f64) -> Result<Self, &'static str> {
        if *arg1 >= 0.0 {
            Ok(Self { r: *arg1 })
        } else {
            Err("Circle radius must be greater or equal to zero!")
        }
    }
    pub fn set_r(&mut self, r: &f64) -> Result<(), &'static str> {
        // TODO Create and implement the setter method called `set_r` and set the field `r` of the Circle struct
        // If the parameter is greater or equal to zero, update it and return Ok(())
        // otherwise return an Err (similar to try_new method)
        if *r >= 0.0 {
            self.r = *r;
            Ok(())
        } else {
            Err("Circle radius must be greater or equal to zero!")
        }
    }
    /// Get for Radius
    pub fn get_r(&self) -> f64 {
        self.r
    }
}

// ------------------------------------------------------------------------------------------------
// Trait Shape implementations for Structs
// Since the Calculator is not a shape, we don't implement Shape functions for the Calculator struct.
//
impl Shape for Rectangle {
    /// Computes Area of given Rectangle
    fn area(&self) -> f64 {
        self.a * self.b
    }
    /// Computes Circumference of given Rectangle
    fn circumference(&self) -> f64 {
        // TODO Calculate the circumference of the rectangle.
        2.0 * (self.a + self.b)
    }
}

impl Shape for Circle {
    /// Computes Area of given Circle
    fn area(&self) -> f64 {
        std::f64::consts::PI * (self.r * self.r)
    }
    /// Computes Circumference of given Circle
    fn circumference(&self) -> f64 {
        2.0 * std::f64::consts::PI * self.r
    }
}
// TODO Implement the Shape trait and its methods for the Circle struct
// Hint: you can use std::f64::consts::PI

// ------------------------------------------------------------------------------------------------
// Examples
//
fn calculator_example() {
    // initialize operands
    let x_in: i64 = -53;
    let y_in: i64 = 17;
    // initialize calculator instance with the initialized operands
    let calculator = Calculator::new(&x_in, &y_in);

    // print operands and show operations results
    println!("{calculator}"); // we can use println!() macro because we have implemented the fmt::Display trait for Calculator (see below)
}

fn rectangle_example() {
    let a_in: f64 = 7.0;
    let b_in: f64 = 3.0;
    let mut rectangle = Rectangle::try_new(&a_in, &b_in).unwrap();

    println!("{rectangle}"); // we can use println!() macro because we have implemented the fmt::Display trait for Rectangle

    let new_a_in: f64 = 15.0;
    let new_b_in: f64 = 2.0;

    let res = rectangle.set_a(&new_a_in);
    assert!(res.is_ok());

    let res = rectangle.set_b(&new_b_in);
    assert!(res.is_ok());

    println!("{rectangle}");

    let new_b_in: f64 = -2.0;

    let res = rectangle.set_b(&new_b_in);

    assert_eq!(
        res.err(),
        Some("Rectangle sides must be greater or equal to zero!")
    );
}
fn circle_example() {
    let r_in: f64 = 17.0;
    let mut circle = Circle::try_new(&r_in).unwrap();

    println!("{circle}"); // we can use println!() macro because we have implemented the fmt::Display trait for Circle

    let new_r_in: f64 = 15.0;

    let res = circle.set_r(&new_r_in); // an error here will disappear once you implement the set_r method for Circle
    assert!(res.is_ok());

    println!("{circle}");

    let new_r_in: f64 = -15.0;

    let res = circle.set_r(&new_r_in); // an error here will disappear once you implement the set_r method for Circle

    assert_eq!(
        res.err(),
        Some("Circle radius must be greater or equal to zero!")
    );
}
// ------------------------------------------------------------------------------------------------
// Main
//
fn main() {
    calculator_example();
    rectangle_example();
    circle_example();
}

// Implementing this trait for a type will automatically implement the ToString trait for the type,
// allowing the usage of the .to_string() method. Prefer implementing the Display trait for a type,
// rather than ToString. More info here: https://doc.rust-lang.org/std/fmt/trait.Display.html
impl fmt::Display for Calculator {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let mut out =
            "-----------------------------------------------------------------\n".to_string();
        out.push_str("Printing Calculator results\n");
        out.push_str(&format!(
            "{} + {} = {}\n",
            self.x,
            self.y,
            self.addition().unwrap()
        ));
        out.push_str(&format!(
            "{} - {} = {}\n",
            self.x,
            self.y,
            self.subtraction().unwrap()
        ));
        out.push_str(&format!(
            "{} * {} = {}\n",
            self.x,
            self.y,
            self.multiplication().unwrap()
        ));
        out.push_str(&format!(
            "{} / {} = {}\n",
            self.x,
            self.y,
            self.division().unwrap()
        ));
        out.push_str("-----------------------------------------------------------------\n");
        write!(f, "{}", out)
    }
}

impl fmt::Display for Rectangle {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let mut out =
            "-----------------------------------------------------------------\n".to_string();
        out.push_str("Printing Rectangle\n");
        out.push_str(&format!(
            "a:{}, b:{}, area:{}, circumference:{}\n",
            self.get_a(),
            self.get_b(),
            self.area(),
            self.circumference(),
        ));
        out.push_str("-----------------------------------------------------------------\n");
        write!(f, "{}", out)
    }
}

impl fmt::Display for Circle {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let mut out =
            "-----------------------------------------------------------------\n".to_string();
        out.push_str("Printing Circle\n");
        out.push_str(&format!(
            "r:{}, area:{}, circumference:{}\n",
            self.get_r(),
            self.area(), // an error here will disappear once you implement the Shape trait for Circle
            self.circumference(), // an error here will disappear once you implement the Shape trait for Circle
        ));
        out.push_str("-----------------------------------------------------------------\n");
        write!(f, "{}", out)
    }
}
