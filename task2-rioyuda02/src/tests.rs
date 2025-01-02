#[cfg(test)]
mod test {
    use crate::Calculator;
    use crate::Circle;
    use crate::Rectangle;
    use crate::Shape;

    use float_cmp::{assert_approx_eq, F64Margin};
    use rand::Rng;

    // default margin
    const MARGIN: F64Margin = F64Margin {
        epsilon: f64::EPSILON,
        ulps: 4,
    };

    macro_rules! circumference {
        // if one argument it is circumference for circle
        ($radius:ident) => {
            2.0 * $radius * std::f64::consts::PI
        };
        // if two arguments it is circumference for rectangle
        ($a:ident,$b:ident) => {
            2.0 * $a + 2.0 * $b
        };
    }

    macro_rules! area {
        // if one argument it is area for circle
        ($radius:ident) => {
            $radius * $radius * std::f64::consts::PI
        };
        // if two arguments it is area for rectangle
        ($a:ident,$b:ident) => {
            $a * $b
        };
    }
    macro_rules! op {
        ($bound:ident, $a:expr, $b:expr) => {
            $a.$bound($b)
        };
    }
    #[test]
    fn addition() {
        let x_in: i64 = 1;
        let y_in: i64 = 5;
        let mut example = Calculator::new(&x_in, &y_in);

        assert_eq!(example.addition(), op!(checked_add, x_in, y_in));

        let new_x_in: i64 = 8;
        let new_y_in: i64 = 57;
        example.x = new_x_in;
        example.y = new_y_in;

        assert_eq!(example.addition(), op!(checked_add, new_x_in, new_y_in));
    }
    #[test]
    fn subtraction() {
        let x_in: i64 = 1;
        let y_in: i64 = 5;
        let mut example = Calculator::new(&x_in, &y_in);

        assert_eq!(example.subtraction(), op!(checked_sub, x_in, y_in));

        let new_x_in: i64 = 13;
        let new_y_in: i64 = 21;
        example.x = new_x_in;
        example.y = new_y_in;

        assert_eq!(example.subtraction(), op!(checked_sub, new_x_in, new_y_in));
    }
    #[test]
    fn multiplication() {
        let x_in: i64 = 1;
        let y_in: i64 = 5;
        let mut example = Calculator::new(&x_in, &y_in);

        assert_eq!(example.multiplication(), op!(checked_mul, x_in, y_in));

        let new_x_in: i64 = 2;
        let new_y_in: i64 = 473;
        example.x = new_x_in;
        example.y = new_y_in;

        assert_eq!(
            example.multiplication(),
            op!(checked_mul, new_x_in, new_y_in)
        );
    }
    #[test]
    fn division() {
        let x_in: i64 = 1;
        let y_in: i64 = 5;
        let mut example = Calculator::new(&x_in, &y_in);

        assert_eq!(example.division(), op!(checked_div, x_in, y_in));

        let new_x_in: i64 = 458991;
        let new_y_in: i64 = 549;
        example.x = new_x_in;
        example.y = new_y_in;

        assert_eq!(example.division(), op!(checked_div, new_x_in, new_y_in));
    }

    #[test]
    fn overflow_add() {
        let x_in: i64 = i64::MAX;
        let y_in: i64 = 1;
        let example = Calculator::new(&x_in, &y_in);

        assert_eq!(example.addition(), None);
    }
    #[test]
    fn overflow_sub() {
        let x_in: i64 = i64::MIN;
        let y_in: i64 = 1;
        let example = Calculator::new(&x_in, &y_in);

        assert_eq!(example.subtraction(), None);
    }
    #[test]
    fn overflow_mul() {
        let x_in: i64 = i64::MAX / 2 + 1;
        let y_in: i64 = 2;
        let example = Calculator::new(&x_in, &y_in);

        assert_eq!(example.multiplication(), None);
    }
    #[test]
    fn overflow_div() {
        let x_in: i64 = i64::MIN;
        let y_in: i64 = -1;
        let example = Calculator::new(&x_in, &y_in);

        assert_eq!(example.division(), None);
    }

    #[test]
    fn zero_div() {
        let x_in: i64 = 58;
        let y_in: i64 = 0;
        let example = Calculator::new(&x_in, &y_in);

        assert_eq!(example.division(), None);
    }

    #[test]
    fn rectangle_area() {
        let a_in: f64 = 15.0;
        let b_in: f64 = 7.0;
        let rectangle = Rectangle::try_new(&a_in, &b_in).unwrap();

        let computed_area = rectangle.area();
        let reference_area = area!(a_in, b_in);

        assert_eq!(computed_area, reference_area);
    }
    #[test]
    fn rectangle_wrong_input() {
        let a_in: f64 = 5.0;
        let b_in: f64 = 7.0;
        let mut rectangle = Rectangle::try_new(&a_in, &b_in).unwrap();

        let new_a_in: f64 = -5.0;
        let res = rectangle.set_a(&new_a_in);

        assert!(res.is_err());
    }
    #[test]
    fn rectangle_area_with_set() {
        let a_in: f64 = 51.0;
        let b_in: f64 = 23.0;
        let mut rectangle = Rectangle::try_new(&a_in, &b_in).unwrap();

        let computed_area = rectangle.area();
        let reference_area = area!(a_in, b_in);

        assert_approx_eq!(f64, computed_area, reference_area, MARGIN);

        let new_a_in: f64 = 8.0;
        let res = rectangle.set_a(&new_a_in);
        assert!(res.is_ok());

        let computed_area = rectangle.area();
        let reference_area = area!(new_a_in, b_in);

        assert_approx_eq!(f64, computed_area, reference_area, MARGIN);

        let new_b_in: f64 = 5.0;
        let res = rectangle.set_b(&new_b_in);
        assert!(res.is_ok());

        let computed_area = rectangle.area();
        let reference_area = area!(new_a_in, new_b_in);

        assert_approx_eq!(f64, computed_area, reference_area, MARGIN);
    }
    #[test]
    fn circle_area() {
        let r_in: f64 = 4.0;
        let circle = Circle::try_new(&r_in).unwrap();

        let computed_area = circle.area(); // an error here will disappear once you implement the area method for Circle
        let reference_area = area!(r_in);

        assert_approx_eq!(f64, computed_area, reference_area, MARGIN);
    }
    #[test]
    fn circle_wrong_input() {
        let r_in: f64 = 5.0;
        let mut circle = Circle::try_new(&r_in).unwrap();

        let new_r_in: f64 = -5.0;
        let res = circle.set_r(&new_r_in);

        assert!(res.is_err());
    }
    #[test]
    fn circle_area_with_set() {
        let r_in: f64 = 17.0;
        let mut circle = Circle::try_new(&r_in).unwrap();

        let computed_area = circle.area(); // an error here will disappear once you implement the Shape trait for Circle
        let reference_area = area!(r_in);

        assert_approx_eq!(f64, computed_area, reference_area, MARGIN);

        let new_r_in: f64 = 8.0;
        let res = circle.set_r(&new_r_in); // an error here will disappear once you implement the set_r method for Circle

        assert!(res.is_ok());

        let computed_area = circle.area(); // an error here will disappear once you implement the Shape trait for Circle
        let reference_area = area!(new_r_in);

        assert_approx_eq!(f64, computed_area, reference_area, MARGIN);
    }
    #[test]
    fn rectangle_circumference() {
        let a_in: f64 = 15.0;
        let b_in: f64 = 7.0;
        let rectangle = Rectangle::try_new(&a_in, &b_in).unwrap();

        let computed_circ = rectangle.circumference();
        let reference_circ = circumference!(a_in, b_in);

        assert_approx_eq!(f64, computed_circ, reference_circ, MARGIN);
    }
    #[test]
    fn rectangle_circumference_with_set() {
        let a_in: f64 = 584.0;
        let b_in: f64 = 1287.0;
        let mut rectangle = Rectangle::try_new(&a_in, &b_in).unwrap();

        let computed_circ = rectangle.circumference();
        let reference_circ = circumference!(a_in, b_in);

        assert_approx_eq!(f64, computed_circ, reference_circ, MARGIN);

        let new_a_in: f64 = 8.0;
        let res = rectangle.set_a(&new_a_in);
        assert!(res.is_ok());

        let computed_circ = rectangle.circumference();
        let reference_circ = circumference!(new_a_in, b_in);

        assert_approx_eq!(f64, computed_circ, reference_circ, MARGIN);

        let new_b_in: f64 = 8.0;
        let res = rectangle.set_b(&new_b_in);
        assert!(res.is_ok());

        let computed_circ = rectangle.circumference();
        let reference_circ = circumference!(new_a_in, new_b_in);

        assert_approx_eq!(f64, computed_circ, reference_circ, MARGIN);
    }
    #[test]
    fn circle_circumference() {
        let r_in: f64 = 7.0;
        let circle = Circle::try_new(&r_in).unwrap();

        let computed_circ = circle.circumference(); // an error here will disappear once you implement the Shape trait for Circle
        let reference_circ = circumference!(r_in);

        assert_approx_eq!(f64, computed_circ, reference_circ, MARGIN);
    }
    #[test]
    fn circle_circumference_with_set() {
        let r_in: f64 = 3.0;
        let mut circle = Circle::try_new(&r_in).unwrap();

        let computed_circ = circle.circumference(); // an error here will disappear once you implement the Shape trait for Circle
        let reference_circ = circumference!(r_in);

        assert_approx_eq!(f64, computed_circ, reference_circ, MARGIN);

        let new_r_in: f64 = 8.0;
        let res = circle.set_r(&new_r_in); // an error here will disappear once you implement the set_r method for Circle
        assert!(res.is_ok());

        let computed_circ = circle.circumference(); // an error here will disappear once you implement the Shape trait for Circle
        let reference_circ = circumference!(new_r_in);

        assert_approx_eq!(f64, computed_circ, reference_circ, MARGIN);
    }
    #[test]
    fn random_inputs_calculator() {
        let mut rng = rand::thread_rng();
        for _ in 0..50_000 {
            let x_in = rng.gen::<i64>();
            let y_in = rng.gen::<i64>();

            let example = Calculator::new(&x_in, &y_in);
            assert_eq!(example.addition(), op!(checked_add, x_in, y_in));
            assert_eq!(example.subtraction(), op!(checked_sub, x_in, y_in));
            assert_eq!(example.multiplication(), op!(checked_mul, x_in, y_in));
            assert_eq!(example.division(), op!(checked_div, x_in, y_in));
        }
    }
    #[test]
    fn random_inputs_shapes() {
        let mut rng = rand::thread_rng();
        for _ in 0..50_000 {
            let a_sign = if rng.gen::<bool>() { 1.0 } else { -1.0 };
            let a_magnitude: f64 = rng.gen::<f64>();
            let a_in = a_sign * a_magnitude * f32::MAX as f64;

            let b_sign = if rng.gen::<bool>() { 1.0 } else { -1.0 };
            let b_magnitude: f64 = rng.gen::<f64>();
            let b_in = b_sign * b_magnitude * f32::MAX as f64;

            let r_sign = if rng.gen::<bool>() { 1.0 } else { -1.0 };
            let r_magnitude: f64 = rng.gen::<f64>();
            let r_in = r_sign * r_magnitude * f32::MAX as f64;

            let circle = Circle::try_new(&r_in);
            let rectangle = Rectangle::try_new(&a_in, &b_in);

            if r_in < 0.0 {
                assert!(circle.is_err());
            } else {
                let circle = circle.unwrap();

                let computed_circ = circle.circumference(); // an error here will disappear once you implement the Shape trait for Circle
                let computed_area = circle.area(); // an error here will disappear once you implement the Shape trait for Circle

                let reference_circ = circumference!(r_in);
                let reference_area = area!(r_in);

                assert_approx_eq!(f64, computed_circ, reference_circ, MARGIN);
                assert_approx_eq!(f64, computed_area, reference_area, MARGIN);
            }

            if a_in < 0.0 || b_in < 0.0 {
                assert!(rectangle.is_err());
            } else {
                let rectangle = rectangle.unwrap();
                let computed_circ = rectangle.circumference();
                let computed_area = rectangle.area();

                let reference_circ = circumference!(a_in, b_in);
                let reference_area = area!(a_in, b_in);

                assert_approx_eq!(f64, computed_circ, reference_circ, MARGIN);
                assert_approx_eq!(f64, computed_area, reference_area, MARGIN);
            }
        }
    }
}
