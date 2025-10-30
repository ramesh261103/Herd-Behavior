from flask import Flask, jsonify, request
import pandas as pd
import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from flask_cors import CORS
from config import SENDER_EMAIL, SENDER_PASSWORD, DEFAULT_RECIPIENTS

app = Flask(__name__)
CORS(app)  # allow frontend to talk to backend

# Load fake dataset
data = pd.read_csv("fake_data.csv")

@app.route("/api/products", methods=["GET"])
def get_products():
    # return top products sorted by sales
    top_products = data.sort_values(by="sales", ascending=False).head(10)
    return jsonify(top_products.to_dict(orient="records"))

@app.route("/api/summary", methods=["GET"])
def get_summary():
    # Basic KPIs and aggregates for richer visualizations
    total_sales = int(data["sales"].sum())
    total_clicks = int(data["clicks"].sum())
    avg_sales = float(round(data["sales"].mean(), 2))
    avg_clicks = float(round(data["clicks"].mean(), 2))
    top_row = data.sort_values(by="sales", ascending=False).iloc[0]
    top_product = {
        "product_id": int(top_row["product_id"]),
        "product_name": str(top_row["product_name"]),
        "sales": int(top_row["sales"]),
        "clicks": int(top_row["clicks"]),
    }
    return jsonify({
        "total_sales": total_sales,
        "total_clicks": total_clicks,
        "avg_sales": avg_sales,
        "avg_clicks": avg_clicks,
        "top_product": top_product,
    })

@app.route("/api/products/pricing", methods=["GET"])
def get_products_with_pricing():
    # Return all products with pricing information
    products_with_pricing = data.sort_values(by="sales", ascending=False)
    return jsonify(products_with_pricing.to_dict(orient="records"))

@app.route("/api/categories", methods=["GET"])
def get_categories():
    # Return category statistics
    category_stats = data.groupby("category").agg({
        "sales": "sum",
        "clicks": "sum",
        "price": "mean",
        "product_id": "count"
    }).round(2)
    category_stats.columns = ["total_sales", "total_clicks", "avg_price", "product_count"]
    category_stats = category_stats.reset_index()
    return jsonify(category_stats.to_dict(orient="records"))

@app.route("/send-alert", methods=["POST"])
def send_alert():
    try:
        request_data = request.json if request.is_json else {}
        product_id = request_data.get("product_id")
        custom_recipients = request_data.get("to", [])
        
        # Determine recipients
        if custom_recipients:
            if isinstance(custom_recipients, str):
                recipients = [custom_recipients]
            else:
                recipients = custom_recipients
        else:
            recipients = DEFAULT_RECIPIENTS
        
        # Prepare email content
        if product_id:
            # Send product-specific email
            product = data[data['product_id'] == product_id].iloc[0]
            html = create_product_email(product)
            subject = f"🔥 {product['product_name']} - Trending Now!"
        else:
            # Send general trending products email
            top_products = data.sort_values(by="sales", ascending=False).head(10)
            html = create_trending_products_email(top_products)
            subject = "📈 Trending Products Alert"

        # Send email to all recipients
        sent_count = 0
        failed_recipients = []
        
        for recipient in recipients:
            try:
                # Create new message for each recipient
                msg = MIMEMultipart("alternative")
                msg["Subject"] = subject
                msg["From"] = SENDER_EMAIL
                msg["To"] = recipient
                msg.attach(MIMEText("Product alert (HTML only)", "plain"))
                msg.attach(MIMEText(html, "html"))

                # Create new SSL context for each email
                context = ssl.create_default_context()
                context.check_hostname = False
                context.verify_mode = ssl.CERT_NONE
                
                # Send email with timeout
                with smtplib.SMTP_SSL('smtp.gmail.com', 465, context=context, timeout=30) as smtp:
                    smtp.login(SENDER_EMAIL, SENDER_PASSWORD)
                    smtp.send_message(msg)
                
                sent_count += 1
                print(f"Email sent successfully to {recipient}")
                
            except smtplib.SMTPAuthenticationError as e:
                print(f"Authentication failed for {recipient}: {str(e)}")
                failed_recipients.append(f"{recipient} (Auth failed)")
            except smtplib.SMTPException as e:
                print(f"SMTP error for {recipient}: {str(e)}")
                failed_recipients.append(f"{recipient} (SMTP error)")
            except Exception as e:
                print(f"Failed to send to {recipient}: {str(e)}")
                failed_recipients.append(f"{recipient} (Error: {str(e)})")

        # Return response
        if sent_count > 0:
            success_message = f"Email sent to {sent_count} recipient(s): {', '.join(recipients[:sent_count])}"
            if failed_recipients:
                success_message += f" | Failed: {', '.join(failed_recipients)}"
            return jsonify({"status": "success", "message": success_message})
        else:
            return jsonify({"status": "error", "message": f"Failed to send to all recipients: {', '.join(failed_recipients)}"}), 500
            
    except Exception as e:
        return jsonify({"status": "error", "message": f"Failed to process email request: {str(e)}"}), 500

@app.route("/test-email", methods=["POST"])
def test_email():
    """Simple test endpoint to verify email configuration"""
    try:
        test_recipient = request.json.get("to", DEFAULT_RECIPIENTS[0]) if request.is_json else DEFAULT_RECIPIENTS[0]
        
        # Simple test email
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "🧪 HerdScope Email Test"
        msg["From"] = SENDER_EMAIL
        msg["To"] = test_recipient
        
        html_content = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Email Test</title>
        </head>
        <body style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h1 style="color: #4f46e5; text-align: center;">✅ Email Test Successful!</h1>
                <p style="text-align: center; color: #666;">Your HerdScope email system is working correctly.</p>
                <p style="text-align: center; color: #666;">Timestamp: """ + pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S') + """</p>
            </div>
        </body>
        </html>
        """
        
        msg.attach(MIMEText("Email test successful!", "plain"))
        msg.attach(MIMEText(html_content, "html"))

        # Send test email
        context = ssl.create_default_context()
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE
        
        with smtplib.SMTP_SSL('smtp.gmail.com', 465, context=context, timeout=30) as smtp:
            smtp.login(SENDER_EMAIL, SENDER_PASSWORD)
            smtp.send_message(msg)

        return jsonify({"status": "success", "message": f"Test email sent successfully to {test_recipient}"})
        
    except Exception as e:
        return jsonify({"status": "error", "message": f"Test email failed: {str(e)}"}), 500

def create_product_email(product):
    status_color = {
        'Hot': '#ef4444',
        'Trending': '#f59e0b', 
        'Regular': '#6b7280'
    }.get(product['status'], '#6b7280')
    
    status_icon = {
        'Hot': '🔥',
        'Trending': '📈',
        'Regular': '📊'
    }.get(product['status'], '📊')

    # Calculate some additional metrics
    conversion_rate = (product['sales'] / product['views']) * 100 if product['views'] > 0 else 0
    revenue = product['sales'] * product['price']

    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Herd Behavior Alert - {product['product_name']}</title>
    </head>
    <body style="margin:0;padding:0;font-family:Inter,Segoe UI,Arial,sans-serif;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);">
        <div style="padding:40px 20px;min-height:100vh;">
            <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:20px;box-shadow:0 20px 40px rgba(0,0,0,0.1);overflow:hidden;">
                <!-- Header -->
                <div style="background:linear-gradient(135deg,#4f46e5,#06b6d4);padding:30px;text-align:center;color:#fff;position:relative;">
                    <div style="position:absolute;top:10px;right:20px;background:rgba(255,255,255,0.2);padding:8px 12px;border-radius:20px;font-size:12px;">
                        {product['category']}
                    </div>
                    <div style="font-size:48px;margin-bottom:10px;">{status_icon}</div>
                    <h1 style="margin:0;font-size:28px;font-weight:700;">Herd Behavior Alert!</h1>
                    <p style="margin:8px 0 0;opacity:0.9;font-size:16px;">This product is trending right now</p>
                </div>
                
                <!-- Product Card -->
                <div style="padding:30px;text-align:center;">
                    <div style="background:linear-gradient(135deg,#f8fafc,#e2e8f0);border-radius:16px;padding:30px;margin-bottom:20px;border:2px solid {status_color};">
                        <h2 style="margin:0 0 10px;font-size:24px;color:#1e293b;font-weight:700;">{product['product_name']}</h2>
                        <div style="display:inline-block;background:{status_color};color:#fff;padding:8px 16px;border-radius:20px;font-size:14px;font-weight:600;margin-bottom:20px;">
                            {product['status']} • {product['click_increase_percent']}% Increase
                        </div>
                        <div style="font-size:36px;font-weight:700;color:#1e293b;margin:20px 0;">
                            ${product['price']}
                        </div>
                    </div>
                    
                    <!-- Stats Grid -->
                    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:20px;margin-bottom:30px;">
                        <div style="background:#f1f5f9;padding:20px;border-radius:12px;text-align:center;border-left:4px solid #059669;">
                            <div style="font-size:32px;font-weight:700;color:#059669;margin-bottom:5px;">{product['views']:,}</div>
                            <div style="color:#64748b;font-size:14px;">Total Views</div>
                        </div>
                        <div style="background:#f1f5f9;padding:20px;border-radius:12px;text-align:center;border-left:4px solid #2563eb;">
                            <div style="font-size:32px;font-weight:700;color:#2563eb;margin-bottom:5px;">{product['clicks']}</div>
                            <div style="color:#64748b;font-size:14px;">Clicks</div>
                        </div>
                        <div style="background:#f1f5f9;padding:20px;border-radius:12px;text-align:center;border-left:4px solid #dc2626;">
                            <div style="font-size:32px;font-weight:700;color:#dc2626;margin-bottom:5px;">{product['sales']}</div>
                            <div style="color:#64748b;font-size:14px;">Sales</div>
                        </div>
                        <div style="background:#f1f5f9;padding:20px;border-radius:12px;text-align:center;border-left:4px solid #7c3aed;">
                            <div style="font-size:32px;font-weight:700;color:#7c3aed;margin-bottom:5px;">{conversion_rate:.1f}%</div>
                            <div style="color:#64748b;font-size:14px;">Conversion Rate</div>
                        </div>
                    </div>
                    
                    <!-- Revenue Highlight -->
                    <div style="background:linear-gradient(135deg,#fbbf24,#f59e0b);padding:20px;border-radius:12px;color:#fff;margin-bottom:20px;">
                        <h3 style="margin:0 0 10px;font-size:20px;">💰 Revenue Generated</h3>
                        <div style="font-size:28px;font-weight:700;">${revenue:,.2f}</div>
                    </div>
                    
                    <!-- CTA -->
                    <div style="background:linear-gradient(135deg,#10b981,#059669);padding:20px;border-radius:12px;color:#fff;text-align:center;">
                        <h3 style="margin:0 0 10px;font-size:20px;">🚀 Don't Miss Out!</h3>
                        <p style="margin:0;opacity:0.9;">This product is experiencing high engagement with {product['click_increase_percent']}% increase in clicks!</p>
                        <div style="margin-top:15px;">
                            <a href="#" style="background:#fff;color:#059669;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">View Product Details</a>
                        </div>
                    </div>
                </div>
                
                <!-- Footer -->
                <div style="padding:20px 30px;background:#f8fafc;color:#64748b;font-size:12px;text-align:center;border-top:1px solid #e2e8f0;">
                    <p style="margin:0;">This is an automated herd behavior alert from HerdScope Analytics</p>
                    <p style="margin:5px 0 0;">Sent at {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """

def create_trending_products_email(top_products):
    rows_html = "".join([
        f"""
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:15px;text-align:center;">
            <div style="background:linear-gradient(135deg,#4f46e5,#06b6d4);color:#fff;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;margin:0 auto;">{i+1}</div>
          </td>
          <td style="padding:15px;">
            <div style="font-weight:600;color:#1e293b;margin-bottom:4px;">{row.product_name}</div>
            <div style="font-size:12px;color:#64748b;">{row.category}</div>
            <div style="font-size:11px;color:#059669;margin-top:2px;">{row.click_increase_percent}% increase</div>
          </td>
          <td style="padding:15px;text-align:center;">
            <div style="font-weight:700;color:#059669;">{int(row.sales)}</div>
          </td>
          <td style="padding:15px;text-align:center;">
            <div style="font-weight:700;color:#2563eb;">{int(row.clicks)}</div>
          </td>
          <td style="padding:15px;text-align:center;">
            <div style="font-weight:700;color:#7c3aed;">${row.price}</div>
          </td>
        </tr>
        """ for i, row in top_products.reset_index(drop=True).iterrows()
    ])

    # Calculate total metrics
    total_sales = top_products['sales'].sum()
    total_clicks = top_products['clicks'].sum()
    total_revenue = (top_products['sales'] * top_products['price']).sum()

    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Trending Products Alert - HerdScope Analytics</title>
    </head>
    <body style="margin:0;padding:0;font-family:Inter,Segoe UI,Arial,sans-serif;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);">
        <div style="padding:40px 20px;min-height:100vh;">
            <div style="max-width:700px;margin:0 auto;background:#ffffff;border-radius:20px;box-shadow:0 20px 40px rgba(0,0,0,0.1);overflow:hidden;">
                <div style="background:linear-gradient(135deg,#4f46e5,#06b6d4);padding:30px;text-align:center;color:#fff;">
                    <h1 style="margin:0;font-size:28px;font-weight:700;">📈 Trending Products Alert</h1>
                    <p style="margin:8px 0 0;opacity:0.9;font-size:16px;">Here are today's top performers</p>
                </div>
                
                <!-- Summary Stats -->
                <div style="padding:20px 30px;background:#f8fafc;border-bottom:1px solid #e2e8f0;">
                    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;text-align:center;">
                        <div>
                            <div style="font-size:24px;font-weight:700;color:#059669;">{total_sales:,}</div>
                            <div style="font-size:12px;color:#64748b;">Total Sales</div>
                        </div>
                        <div>
                            <div style="font-size:24px;font-weight:700;color:#2563eb;">{total_clicks:,}</div>
                            <div style="font-size:12px;color:#64748b;">Total Clicks</div>
                        </div>
                        <div>
                            <div style="font-size:24px;font-weight:700;color:#7c3aed;">${total_revenue:,.0f}</div>
                            <div style="font-size:12px;color:#64748b;">Total Revenue</div>
                        </div>
                    </div>
                </div>
                
                <div style="padding:30px;">
                    <table style="width:100%;border-collapse:collapse;">
                        <thead>
                            <tr style="background:#f8fafc;">
                                <th style="padding:15px;text-align:center;color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;">Rank</th>
                                <th style="padding:15px;text-align:left;color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;">Product</th>
                                <th style="padding:15px;text-align:center;color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;">Sales</th>
                                <th style="padding:15px;text-align:center;color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;">Clicks</th>
                                <th style="padding:15px;text-align:center;color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows_html}
                        </tbody>
                    </table>
                    
                    <div style="margin-top:30px;padding:20px;background:linear-gradient(135deg,#f0f9ff,#e0f2fe);border-radius:12px;text-align:center;">
                        <h3 style="margin:0 0 10px;color:#0369a1;font-size:18px;">🎯 Want more insights?</h3>
                        <p style="margin:0;color:#64748b;">Visit your dashboard for detailed charts and analytics</p>
                        <div style="margin-top:15px;">
                            <a href="#" style="background:#0369a1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">View Dashboard</a>
                        </div>
                    </div>
                </div>
                
                <div style="padding:20px 30px;background:#f8fafc;color:#64748b;font-size:12px;text-align:center;border-top:1px solid #e2e8f0;">
                    <p style="margin:0;">This is an automated message from HerdScope Analytics</p>
                    <p style="margin:5px 0 0;">Sent at {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """

if __name__ == "__main__":
    app.run(debug=True)
