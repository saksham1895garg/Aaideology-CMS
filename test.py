def gcd(a, b):
    """Compute the GCD of two numbers using the Euclidean algorithm."""
    while b != 0:
        a, b = b, a % b
    return abs(a)  # Return the absolute value of GCD

# Example usage

num1 = int(input("Number 1: "))
num2 = int(input("Number 2: "))
result = gcd(num1, num2)
print("The GCD of {num1} and {num2} is {result}.")

# question 2
