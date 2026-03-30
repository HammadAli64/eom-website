"""
Email notifications for orders.
Uses SMTP (e.g. Gmail). From address must match sending account to avoid spam/rejection.
"""
import logging
from decimal import Decimal

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)


def _fail_silently():
    return not getattr(settings, "DEBUG", False)


def _send_email(subject, body_plain, body_html, to_emails, reply_to=None, extra_headers=None):
    """Send one email with plain and HTML. Uses DEFAULT_FROM_EMAIL (must match SMTP user for Gmail)."""
    if not getattr(settings, "EMAIL_HOST_USER", None) or not getattr(settings, "EMAIL_HOST_PASSWORD", None):
        logger.warning("Email not sent: EMAIL_HOST_USER or EMAIL_HOST_PASSWORD not set. Set them in .env.")
        return 0
    from_email = settings.DEFAULT_FROM_EMAIL
    headers = dict(extra_headers or {})
    if reply_to:
        headers["Reply-To"] = reply_to
    msg = EmailMultiAlternatives(subject, body_plain, from_email, to_emails, headers=headers)
    msg.attach_alternative(body_html, "text/html")
    try:
        sent = msg.send(fail_silently=_fail_silently())
        if sent:
            logger.info("Email sent to %s: %s", to_emails, subject)
        return sent
    except Exception as e:
        logger.exception("Email failed to %s: %s", to_emails, e)
        if not _fail_silently():
            raise
        return 0


def send_order_confirmation_email(order):
    """Send confirmation to customer with order and price details."""
    items = list(order.items.all())
    items_total = sum((item.subtotal for item in items), Decimal("0"))
    from .models import StoreSettings
    shipping_charge = Decimal(str(StoreSettings.get_solo().delivery_charge))
    grand_total = items_total + shipping_charge

    rows_html = "".join(
        f"""
        <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">{item.product.name} × {item.quantity}</td>
            <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid #eee;">{item.subtotal}</td>
        </tr>
        """
        for item in items
    )

    subject = f"Order Confirmation - {order.order_number}"
    html_message = f"""
    <div style="font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #b8860b; letter-spacing: 0.03em;">Thank you for your order</h2>
        <p>Dear {order.shipping_name},</p>
        <p>Your order <strong>{order.order_number}</strong> has been received.</p>
        <p><strong>You will receive your order within 7–8 business days.</strong></p>

        <h3 style="margin-top: 24px; margin-bottom: 8px; font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">Order summary</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
            <tbody>
                {rows_html}
                <tr>
                    <td style="padding-top: 12px;">Subtotal</td>
                    <td style="padding-top: 12px; text-align: right;">{items_total}</td>
                </tr>
                <tr>
                    <td>Delivery charges</td>
                    <td style="text-align: right;">{shipping_charge}</td>
                </tr>
                <tr>
                    <td style="padding-top: 8px; font-weight: bold;">Order total</td>
                    <td style="padding-top: 8px; text-align: right; font-weight: bold;">{grand_total}</td>
                </tr>
            </tbody>
        </table>

        <p style="margin-top: 24px; font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">If you have any questions, please contact us.</p>
        <p style="font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">Best regards,<br>Bridal Jewelry Store</p>
    </div>
    """
    plain = strip_tags(html_message)
    reply_to = getattr(settings, "ADMIN_EMAIL", None) or getattr(settings, "EMAIL_HOST_USER", None)
    _send_email(
        subject=subject,
        body_plain=plain,
        body_html=html_message,
        to_emails=[order.shipping_email],
        reply_to=reply_to,
    )


def send_admin_order_notification(order):
    """Notify admin of new order."""
    items = list(order.items.all())
    items_total = sum((item.subtotal for item in items), Decimal("0"))
    from .models import StoreSettings
    shipping_charge = Decimal(str(StoreSettings.get_solo().delivery_charge))
    grand_total = items_total + shipping_charge

    rows_html = "".join(
        f"<li>{item.product.name} × {item.quantity} — {item.subtotal}</li>"
        for item in items
    )

    subject = f"New Order: {order.order_number}"
    html_message = f"""
    <div style="font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
        <h2 style="font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; color: #b8860b; letter-spacing: 0.03em;">New order received</h2>
        <p>Order #: {order.order_number}</p>
        <p>Customer: {order.shipping_name} ({order.shipping_email})</p>
        <p>Items:</p>
        <ul style="padding-left: 20px;">
            {rows_html}
        </ul>
        <p>Subtotal: {items_total}</p>
        <p>Delivery: {shipping_charge}</p>
        <p><strong>Total: {grand_total}</strong></p>
        <p>View in admin panel for details.</p>
    </div>
    """
    plain = strip_tags(html_message)
    admin_email = getattr(settings, "ADMIN_EMAIL", None) or settings.DEFAULT_FROM_EMAIL
    if isinstance(admin_email, str) and "<" in admin_email:
        admin_email = admin_email.split("<")[-1].rstrip(">").strip()
    _send_email(
        subject=subject,
        body_plain=plain,
        body_html=html_message,
        to_emails=[admin_email],
    )


def send_password_reset_otp(email: str, otp: str):
    """Send a short OTP to reset password."""
    subject = "Your password reset code"
    html_message = f"""
    <div style="font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; max-width: 560px; margin: 0 auto; color: #333;">
        <h2 style="color: #b8860b; letter-spacing: 0.04em;">Password reset</h2>
        <p style="font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">Use this code to reset your password:</p>
        <p style="font-size: 28px; letter-spacing: 6px; font-weight: bold; margin: 16px 0;">{otp}</p>
        <p style="color: #666; font-size: 14px; font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">This code expires in 10 minutes. If you didn’t request this, you can ignore this email.</p>
        <p style="margin-top: 20px; font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">Bridal Jewelry Store</p>
    </div>
    """
    plain = strip_tags(html_message)
    _send_email(
        subject=subject,
        body_plain=plain,
        body_html=html_message,
        to_emails=[email],
        reply_to=getattr(settings, "ADMIN_EMAIL", None) or getattr(settings, "EMAIL_HOST_USER", None),
    )

