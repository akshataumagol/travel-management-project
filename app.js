const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();
const path = require('path');

const port = process.env.PORT || 3001;

// MySQL database configuration
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'login', 
});

// Connect to the database
db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});// Middleware for parsing request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from the public directory
app.use(express.static('public'));
app.use(session({
  secret: '1234567', // Replace with a strong secret key
  resave: true,
  saveUninitialized: true,
}));

// Define the route for the login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Define the route for the registration page
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Define the route for handling user registration
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  // Hash the password before storing it in the database
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
    } else {
      // Insert the user into the database
      db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
        if (err) {
          console.error(err);
          res.status(500).send('Registration failed');
        } else {
          res.send({message: "User is register successfully "});
        }
      });
    }
  });
});

// Define the route for handling user login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  console.log("asdjahb", req.body)
  db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
    console.log(results)
    if (results.length === 0) {
      res.send({msg: 'User not found'});
    } else {
      const user = results[0];

      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          console.error(err);
          res.status(500).send('Server error');
        }
        if (isMatch) {
          // Store the user's ID in the session
          req.session.userId = user.id;
          /*res.redirect('/home');*/
          const alertMessage = 'Login successful!';
          res.send({message: "User is logined successfully ",data: user});
        } else {
          res.send('Incorrect password');
        }
      });
    }
  });
});// Define the route for user logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});



app.use(bodyParser.json());

// Serve static files (for the HTML page)
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});




app.get('/bookings', (req, res) => {
  // Serve the bookings.html page
  res.sendFile(path.join(__dirname, 'public', 'bookings.html'));
});

app.post('/submit_booking', (req, res) => {
  try {
  // Process booking data and insert it into the database
  const { name, phone, email, package, numPeople, comments } = req.body;
  console.log( name, phone, email, package, numPeople, comments);

  // Insert booking data into the database
  db.query('INSERT INTO bookings (name, phone, email, package, num_people, message) VALUES (?, ?, ?, ?, ?, ?)',
    [name, phone, email, package,  numPeople, comments], (err, result) => {
      if (err) {
        console.error('Error inserting booking data:', err);
        res.status(500).json({ message: 'Booking failed' });
      } else {
        const bookingId = result.insertId;
        
  for (let index = 1; index <= numPeople; index++) {
    storePeopleData({...req.body, bookingId: bookingId }, index)
  }


        // Redirect to the payment page and pass booking ID
        res.redirect(`/payment?booking_id=${bookingId}`);
      }
    });
    
  } catch (error) {
    console.log(error)
  }
});
async function storePeopleData(data, index){
  try {
    console.log("Data and index::>>> ", data, index);

    const name = data[`name${index}`];
    const email = data[`email${index}`];
    const phone = data[`phone${index}`];
    console.log(name, email, phone);
    db.query('INSERT INTO people (bookingId, name, phone, email) VALUES (?, ?, ?, ?)',
    [data.bookingId || 0, name, phone, email],(err, res)=>{
      if (err) {
        console.log("ERROR____<<::>>>".err)
      }
      console.log("data", res);
    });
  } catch (error) {
    console.log(error);
    return false;
  } 
  }
app.get('/payment', (req, res) => {
  // Serve the payment.html page
  res.sendFile(path.join(__dirname, 'public', 'payment.html'));
});


// Add a route to check package availability
app.get('/check_availability', (req, res) => {
  try {
  const selectedPackage = req.query.package;
  const numPeople = parseInt(req.query.numPeople);
  console.log('Selected Package:', selectedPackage);
 console.log('Number of People:', numPeople);


  // Your logic to check availability (e.g., query your database)
  const availabilitySql = 'SELECT availability FROM packages WHERE LOWER(name) = LOWER(?)';
  db.query(availabilitySql, [selectedPackage], (err, result) => {
    if (err) {
      console.error('MySQL error:', err);
      res.status(500).json({ message: 'Error checking package availability' });
    } else {
      console.log("result::>> ", result);
      if (result.length > 0) {
        const availability = result[0].availability;
        if (numPeople <= availability) {
          res.json({ message: 'Package is available for booking' });
        } else {
          res.json({ message: 'Package is not available for booking' });
        }
      } else {
        res.json({ message: 'Package not found' });
      }
    }
  });
  
} catch (error) {
 console.log(error);   
}
}); 
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/process-payment', (req, res) => {
  // Process payment data and insert it into the database
  const { name, email, city, state, zipcode, nameoncard, cardnumber, cvv } = req.body;
  console.log(req.body);
  // Insert payment data into the database
  db.query('INSERT INTO payments (name, email, city, state, zipcode, nameoncard, cardnumber, cvv) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  [name, email, city, state, zipcode, nameoncard, cardnumber, cvv], (err, result) => {
    if (err) {
      console.error('Error inserting payment data:', err);
      res.status(500).json({ message: 'Payment failed' });
    } else {
      const paymentId = result.insertId;
      res.redirect(`/success?payment_id=${paymentId}`);
    }
  });
});

app.get('/success', (req, res) => {
  const paymentId = req.query.payment_id; // Get the payment ID from the query parameter
  console.log('Received payment_id:', paymentId); // Debug statement
  // Query the database to retrieve payment data using paymentId
  const query = 'SELECT nameoncard, cardnumber, cvv , zipcode FROM payments WHERE paymentid = ?';

  db.query(query, [paymentId], (err, result) => {
    if (err) {
      console.error('Error querying the database:', err);
      // Handle the error or show an appropriate message to the user
      res.status(500).send('Error fetching payment data');
    } else {
      const paymentData = result[0];
      console.log('Retrieved payment data:', paymentData); // Debug statement
      if (paymentData) {
        // Send the 'success.html' file with payment data
        // res.sendFile(path.join(__dirname, 'public', 'success.html'));
        res.redirect(`/success.html?payment_id=${paymentId}&nameoncard=${paymentData.nameoncard}&cardnumber=${paymentData.cardnumber}&cvv=${paymentData.cvv}&zipcode=${paymentData.zipcode}`);
      } else {
        // Handle the case where payment data is not found
        // You can show an error message or redirect the user as needed
        res.status(404).send('Payment data not found');
      }
    }
  });
});



app.get('/bookingdetails', (req, res) => {
  const sql = 'SELECT * FROM bookings'; // Select all records from the bookings table
  db.query(sql, (err, results) => {
      if (err) {
          console.error('MySQL Query Error:', err);
          return res.status(500).send('Internal Server Error');
      }

      // Convert the MySQL results to a JSON string
      const bookingData = JSON.stringify(results);

      // Read the content of bookingdetails.html
      const htmlPath = path.join(__dirname, 'public', 'bookingdetails.html');
      let bookingDetailsHtml = fs.readFileSync(htmlPath, 'utf8');

      // Replace the specific marker in the HTML with the JSON data
      bookingDetailsHtml = bookingDetailsHtml.replace('/* {{bookingTablePlaceholder}} */', `var bookingTablePlaceholder = ${bookingData};`);
      
      // Send the updated HTML response
      res.contentType('text/html');
      res.send(bookingDetailsHtml);
  });
});
/**
 * @title get login Details
 */
app.get('/logindetails', (req, res) => {
  db.query('SELECT id, username FROM users', (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json(results);
  });
});

/**
 * @title get booking Details
 */
app.get('/bookingList', (req, res) => {
  db.query('SELECT * FROM bookings', (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
    }
    res.json(results);
  });
});

app.get('/paymentslist', (req, res) => {
  db.query('SELECT * FROM payments', (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json(results);
  });
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
