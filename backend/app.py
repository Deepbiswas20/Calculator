from flask import Flask, request, jsonify
from flask_cors import CORS
import math

app = Flask(__name__)
CORS(app)

@app.route("/calculate", methods=["POST"])
def calculate():
    """Handle basic arithmetic operations"""
    try:
        data = request.json
        a = float(data.get("a"))
        b = float(data.get("b"))
        op = data.get("operation")

        if op == "+":
            result = a + b
        elif op == "-":
            result = a - b
        elif op == "*":
            result = a * b
        elif op == "/":
            if b == 0:
                return jsonify({"error": "Division by zero"}), 400
            result = a / b
        elif op == "pow":
            try:
                result = math.pow(a, b)
                # Check for overflow
                if math.isinf(result) or math.isnan(result):
                    return jsonify({"error": "Result is too large or undefined"}), 400
            except (OverflowError, ValueError) as e:
                return jsonify({"error": "Calculation overflow"}), 400
        elif op == "mod":
            if b == 0:
                return jsonify({"error": "Modulo by zero"}), 400
            result = a % b
        else:
            return jsonify({"error": "Invalid operation"}), 400

        return jsonify({"result": result})

    except (ValueError, TypeError) as e:
        return jsonify({"error": "Invalid input"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/scientific", methods=["POST"])
def scientific():
    """Handle scientific calculations"""
    try:
        data = request.json
        value = float(data.get("value"))
        func = data.get("function")

        if func == "sin":
            result = math.sin(math.radians(value))
        elif func == "cos":
            result = math.cos(math.radians(value))
        elif func == "tan":
            result = math.tan(math.radians(value))
        elif func == "log":
            if value <= 0:
                return jsonify({"error": "Logarithm of non-positive number"}), 400
            result = math.log10(value)
        elif func == "ln":
            if value <= 0:
                return jsonify({"error": "Natural log of non-positive number"}), 400
            result = math.log(value)
        elif func == "exp":
            try:
                result = math.exp(value)
                if math.isinf(result):
                    return jsonify({"error": "Result is too large"}), 400
            except OverflowError:
                return jsonify({"error": "Exponential overflow"}), 400
        elif func == "sqrt":
            if value < 0:
                return jsonify({"error": "Square root of negative number"}), 400
            result = math.sqrt(value)
        elif func == "factorial":
            if value < 0:
                return jsonify({"error": "Factorial of negative number"}), 400
            if value > 170:
                return jsonify({"error": "Factorial too large"}), 400
            if value != int(value):
                return jsonify({"error": "Factorial requires integer"}), 400
            result = math.factorial(int(value))
        else:
            return jsonify({"error": "Invalid function"}), 400

        # Check for NaN or Inf results
        if math.isnan(result) or math.isinf(result):
            return jsonify({"error": "Result is undefined or infinite"}), 400

        return jsonify({"result": result})

    except (ValueError, TypeError) as e:
        return jsonify({"error": "Invalid input"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "Calculator API is running"})


@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500


if __name__ == "__main__":
    print("="*50)
    print("Scientific Calculator API Server")
    print("Server running on http://127.0.0.1:5000")
    print("="*50)
    app.run(debug=True, host='127.0.0.1', port=5000)
