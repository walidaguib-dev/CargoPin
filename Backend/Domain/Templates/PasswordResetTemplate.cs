using System;

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
                                We received a request to reset your password. Click the button below
                                or use the token to reset it manually. This link will expire in <strong>2 hours</strong>.
                              </p>

                              

                              <!-- Token Box -->
                              <table width="100%" cellpadding="0" cellspacing="0"
                                     style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:32px;">
                                <tr>
                                  <td style="padding:20px;text-align:center;">
                                    <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">
                                      Or copy your reset token and use it manually:
                                    </p>
                                    <p style="margin:0;color:#111827;font-size:15px;font-weight:700;
                                              letter-spacing:2px;word-break:break-all;font-family:monospace;">
                                      {token}
                                    </p>
                                  </td>
                                </tr>
                              </table>

                              <!-- Security Warning Box -->
                              <table width="100%" cellpadding="0" cellspacing="0"
                                     style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;margin-bottom:24px;">
                                <tr>
                                  <td style="padding:16px;">
                                    <p style="margin:0;color:#9a3412;font-size:13px;line-height:1.6;">
                                      ⚠️ <strong>Security notice:</strong> If you didn't request a password reset,
                                      please ignore this email. Your password will not change unless you use the link or token above.
                                    </p>
                                  </td>
                                </tr>
                              </table>

                              <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />

                              <p style="margin:0;color:#9ca3af;font-size:13px;line-height:1.6;">
                                For security reasons, this token expires in 2 hours and can only be used once.
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
