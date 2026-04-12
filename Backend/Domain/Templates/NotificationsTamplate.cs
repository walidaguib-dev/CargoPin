using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Templates
{
    public class NotificationsTamplate
    {
        public static string GetTemplate()
        {
            return $"""
                <!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="UTF-8" />
                  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                  <title>You have a new notification</title>
                </head>
                <body style="margin:0;padding:0;background-color:#f4f6f8;font-family:'Segoe UI',Arial,sans-serif;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:40px 0;">
                    <tr>
                      <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

                          <!-- Header -->
                          <tr>
                            <td style="background:linear-gradient(135deg,#3b82f6,#6366f1);padding:40px;text-align:center;">
                              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">
                                🔔 New Notification
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
                                You have a new notification from MyApp. Log in to your dashboard to see the full details.
                              </p>

                              <!-- Notification Card -->
                              <table width="100%" cellpadding="0" cellspacing="0"
                                     style="background:#eff6ff;border:1px solid #bfdbfe;border-left:4px solid #3b82f6;border-radius:8px;margin-bottom:32px;">
                                <tr>
                                  <td style="padding:20px;">
                                    <p style="margin:0 0 4px;color:#1e40af;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">
                                      New Activity
                                    </p>
                                    <p style="margin:0;color:#374151;font-size:15px;line-height:1.6;">
                                      Something happened on your account that requires your attention. Visit your dashboard for more details.
                                    </p>
                                  </td>
                                </tr>
                              </table>

                              <!-- CTA Button -->
                              <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                                <tr>
                                  <td style="background:linear-gradient(135deg,#3b82f6,#6366f1);border-radius:8px;padding:14px 32px;text-align:center;">
                                    <a href="https://myapp.com/dashboard"
                                       style="color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;display:block;">
                                      View in Dashboard →
                                    </a>
                                  </td>
                                </tr>
                              </table>

                              <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />

                              <p style="margin:0;color:#9ca3af;font-size:13px;line-height:1.6;">
                                You're receiving this because you have notifications enabled.
                                <a href="https://myapp.com/settings/notifications" style="color:#3b82f6;">Manage preferences</a>
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
