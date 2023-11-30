package main

import (
	"fmt"
)

// func main() {
// 	// fmt.Println("When's Saturday?")
// 	// today := time.Saturday

// 	// switch time.Saturday {
// 	// case today + 0:
// 	// 	fmt.Println("Today.")
// 	// case today + 1:
// 	// 	fmt.Println("Tomorrow.")
// 	// case today + 2:
// 	// 	fmt.Println("In two days.")
// 	// default:
// 	// 	fmt.Println("Too far away.")
// 	// }
// 	swap()
// }

func swap(x, y string) (string, string) {
	return y, x
}

func main() {
	a, b := swap("hello", "world")
	fmt.Println(a, b)
}
