---
title: "Understanding Big O Notation"
date: "2025-07-08"
excerpt: "A simple explanation of Big O notation and common time complexities"
---

In simple terms, Big (o) evaluates the lines of code to understand the complexity of the algorithm. It analizes the long-term growth rate of functions opposed to their absolute magnitudes.

O(1): This is constant time, the input values doesnt change the complexity.

- Example: `function sayHi() {
  return 'Hello world'
}`

O(N): The time changes because of the size of the data input. Most common cases are mapping, filtering, etc. As the number of data points in the array grows, so does the runtime.

- Example: `function findValue(array, value) {
  for (let i = 0; i < array.length; i++) {
  if (array[i] === value) {
  return true }
  }
  return false
  }

O(log N): This is an algorithm that divides the problem why half in each iteration. The most common example is binary search.

O (Nm): If you have a loop inside a loop. But not any nested loop is a O (Nm), just in the cases where both the loops depend of n.

O (Kn): If you diagram this, it would look like a tree, because each time you call a function, that function calls other two functions. The most common example is Fibonacci.
