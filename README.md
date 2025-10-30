# Herd Behavior Dashboard

A full-stack dashboard application that tracks trending products and customer behavior patterns. The dashboard displays product sales data, click analytics, and allows sending alerts to customers about trending products.

## 🏗️ Project Structure

```
herd-behavior-dashboard/
├── backend/
│   ├── app.py          # Flask backend with API + email sending
│   ├── fake_data.csv   # Synthetic dataset of product sales/clicks
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx     # Main dashboard UI
│   │   ├── index.js    # React entry point
│   │   └── index.css   # Tailwind CSS styles
│   ├── public/
│   │   └── index.html  # HTML template
│   ├── package.json    # Frontend dependencies
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## 🛠️ Backend (Flask API + Fake Dataset)

The backend provides:
- REST API endpoints for product data
- Email alert functionality
- CORS support for frontend communication

### Setup Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

The backend will run on `http://localhost:5000`

### API Endpoints

- `GET /api/products` - Returns top 10 products sorted by sales
- `POST /send-alert` - Sends email alert to customers

## 🎨 Frontend (React + Tailwind + Recharts)

The frontend features:
- Interactive charts (Line and Bar charts)
- Top products list
- Product cards grid
- Email alert button

### Setup Frontend

```bash
cd frontend
npm install
npm start
```

The frontend will run on `http://localhost:3000`

## 🚀 How It Works

1. **Backend** serves the fake dataset and provides email API
2. **Frontend** fetches data and displays:
   - Line chart showing product clicks
   - Bar chart showing product sales
   - Top 5 products list
   - Grid of all product cards
3. **Send Alert** button triggers email notification to customers

## 📊 Features

- **Real-time Data Visualization**: Interactive charts using Recharts
- **Responsive Design**: Built with Tailwind CSS
- **Email Integration**: SMTP email alerts for trending products
- **Product Analytics**: Sales and click tracking
- **Modern UI**: Clean, professional dashboard interface

## 🔧 Technologies Used

### Backend
- Flask (Python web framework)
- Pandas (data manipulation)
- SMTP (email sending)
- Flask-CORS (cross-origin requests)

### Frontend
- React 18
- Tailwind CSS (styling)
- Recharts (data visualization)
- Modern JavaScript (ES6+)

## 📝 Configuration

### Email Setup
To enable email alerts, update the email credentials in `backend/app.py`:
- Replace `youremail@gmail.com` with your Gmail address
- Replace `your-app-password` with your Gmail app password
- Update the recipient email address

### Data Customization
Modify `backend/fake_data.csv` to add your own product data with columns:
- `product_id`: Unique identifier
- `product_name`: Product name
- `sales`: Number of sales
- `clicks`: Number of clicks/views

## 🎯 Usage

1. Start the backend server
2. Start the frontend development server
3. Open `http://localhost:3000` in your browser
4. View the dashboard with product analytics
5. Click "Send Alert to Customers" to trigger email notifications

The dashboard provides insights into product performance and customer behavior patterns, helping businesses identify trending products and optimize their marketing strategies.
"# Herd-Behavior" 
