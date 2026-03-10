<!DOCTYPE html>
<html lang="hi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wingo Lottery Login</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .login-card {
            background: #fff;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            width: 320px;
        }
        .login-card h2 {
            text-align: center;
            color: #333;
            margin-bottom: 20px;
        }
        .input-group {
            margin-bottom: 15px;
        }
        .input-group label {
            display: block;
            margin-bottom: 5px;
            color: #666;
        }
        .input-group input {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            box-sizing: border-box; /* Padding se width na badhe */
        }
        .login-btn {
            width: 100%;
            padding: 10px;
            background-color: #28a745;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        }
        .login-btn:hover {
            background-color: #218838;
        }
        .footer-links {
            text-align: center;
            margin-top: 15px;
            font-size: 14px;
        }
        .footer-links a {
            color: #007bff;
            text-decoration: none;
        }
    </style>
</head>
<body>

<div class="login-card">
    <h2>Wingo Login</h2>
    <form action="login.php" method="POST">
        <div class="input-group">
            <label for="mobile">Mobile Number</label>
            <input type="tel" id="mobile" name="mobile" placeholder="Enter Mobile No." required pattern="[0-9]{10}">
        </div>
        
        <div class="input-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" placeholder="Enter Password" required>
        </div>

        <button type="submit" class="login-btn">Login Now</button>
    </form>

    <div class="footer-links">
        <p>Don't have an account? <a href="register.html">Register</a></p>
    </div>
</div>

</body>
</html>
