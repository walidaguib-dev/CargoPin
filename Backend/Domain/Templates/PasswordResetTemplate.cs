using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Templates
{
    public class PasswordResetTemplate
    {
        public static string GetTemplate(string token)
        {
            return $"""
                <!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="UTF-8" />
                  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                  <title>Reset Your Password</title>
                </head>
                <body style="margin:0;padding:0;background-color:#f4f6f8;font-family:'Segoe UI',Arial,sans-serif;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:40px 0;">
                    <tr>
                      <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

                          <!-- Header -->
                          <tr>
                            <td style="background:linear-gradient(135deg,#ef4444,#f97316);padding:40px;text-align:center;">
                              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">
                                🔐 Reset Your Password
                              </h1>
                            </td>
                          </tr>

                          <!-- Body -->
                          <tr>
                            <td style="padding:40px;">
                              <p style="margin:0 0 16px;color:#374151;font-size:16px;line-height:1.6;">
                                Hi there 👋,
                              </p>
                              <p style="margin:0 0 24px;color:#374151;font-size:16px;line-height:1.6;">
                                We received a request to reset your password. Click the button below to choose a new one.
                                This link will expire in <strong>2 hours</strong>.
                              </p>

                              <!-- CTA Button -->
                              <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                                <tr>
                                  <td style="background:linear-gradient(135deg,#ef4444,#f97316);border-radius:8px;padding:14px 32px;text-align:center;">
                                    <a href="{token}"
                                       style="color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;display:block;">
                                      Reset Password
                                    </a>
                                  </td>
                                </tr>
                              </table>

                              <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">
                                If the button doesn't work, copy and paste this link into your browser:
                              </p>
                              <p style="margin:0 0 24px;word-break:break-all;">
                                <a href="{token}" style="color:#ef4444;font-size:13px;">{token}</a>
                              </p>

                              <!-- Security Warning Box -->
                              <table width="100%" cellpadding="0" cellspacing="0"
                                     style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;margin-bottom:24px;">
                                <tr>
                                  <td style="padding:16px;">
                                    <p style="margin:0;color:#9a3412;font-size:13px;line-height:1.6;">
                                      ⚠️ <strong>Security notice:</strong> If you didn't request a password reset,
                                      please ignore this email. Your password will not change unless you click the link above.
                                    </p>
                                  </td>
                                </tr>
                              </table>

                              <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />

                              <p style="margin:0;color:#9ca3af;font-size:13px;line-height:1.6;">
                                For security reasons, this link expires in 2 hours and can only be used once.
                              </p>
                            </td>
                          </tr>

                          <!-- Footer -->
                          <tr>
                            <td style="background:#f9fafb;padding:24px;text-align:center;border-top:1px solid #e5e7eb;">
                              <p style="margin:0;color:#9ca3af;font-size:12px;">
                                © {DateTime.UtcNow.Year} MyApp. All rights reserved.
                              </p>
                            </td>
                          </tr>

                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """;
        }
    }
}
