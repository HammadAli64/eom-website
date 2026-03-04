"""
Email notifications for orders.
"""
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags


def send_order_confirmation_email(order):
    """Send confirmation to customer."""
    subject = f"Order Confirmation - {order.order_number}"
    html_message = f"""
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #b8860b;">Thank you for your order</h2>
        <p>Dear {order.shipping_name},</p>
        <p>Your order <strong>{order.order_number}</strong> has been received.</p>
        <p><strong>You will receive your order within 7–8 business days.</strong></p>
        <p>Total: ${order.total}</p>
        <p>If you have any questions, please contact us.</p>
        <p>Best regards,<br>Bridal Jewelry Store</p>
    </div>
    """
    plain = strip_tags(html_message)
    send_mail(
        subject=subject,
        message=plain,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[order.shipping_email],
        html_message=html_message,
        fail_silently=True,
    )


def send_admin_order_notification(order):
    """Notify admin of new order."""
    subject = f"New Order: {order.order_number}"
    html_message = f"""
    <div style="font-family: sans-serif;">
        <h2>New order received</h2>
        <p>Order #: {order.order_number}</p>
        <p>Customer: {order.shipping_name} ({order.shipping_email})</p>
        <p>Total: ${order.total}</p>
        <p>View in admin panel for details.</p>
    </div>
    """
    plain = strip_tags(html_message)
    admin_email = getattr(settings, 'ADMIN_EMAIL', None) or settings.DEFAULT_FROM_EMAIL
    send_mail(
        subject=subject,
        message=plain,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[admin_email],
        html_message=html_message,
        fail_silently=True,
    )
