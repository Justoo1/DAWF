// Email Templates
// These are pure functions that return HTML strings for emails

export function birthdayWishTemplate(employeeName: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10A074 0%, #2F7A67 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 32px;">🎉 Happy Birthday! 🎉</h1>
        </div>

        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <p style="font-size: 18px; margin-bottom: 20px;">Dear ${employeeName},</p>

          <p style="font-size: 16px; margin-bottom: 20px;">
            🎂 Wishing you a very happy birthday from all of us at DevOps Africa Limited!
          </p>

          <p style="font-size: 16px; margin-bottom: 20px;">
            May this special day bring you joy, success, and wonderful memories. We're grateful to have you as part of our team!
          </p>

          <p style="font-size: 16px; margin-bottom: 20px;">
            Enjoy your special day! 🎈
          </p>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #10A074;">
            <p style="font-size: 14px; color: #666; margin: 0;">
              Best wishes,<br>
              <strong>DevOps Africa Welfare Fund</strong>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function childbirthCongratulationsTemplate(parentName: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10A074 0%, #2F7A67 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">👶 Congratulations! 👶</h1>
        </div>

        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <p style="font-size: 18px; margin-bottom: 20px;">Dear ${parentName},</p>

          <p style="font-size: 16px; margin-bottom: 20px;">
            🎊 Warmest congratulations on the arrival of your new baby!
          </p>

          <p style="font-size: 16px; margin-bottom: 20px;">
            We're thrilled to hear this wonderful news and share in your joy. May this precious addition to your family bring you endless happiness and unforgettable moments.
          </p>

          <p style="font-size: 16px; margin-bottom: 20px;">
            Wishing you and your family all the best as you embark on this beautiful journey together! 💕
          </p>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #10A074;">
            <p style="font-size: 14px; color: #666; margin: 0;">
              With love and best wishes,<br>
              <strong>DevOps Africa Welfare Fund</strong>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function childbirthAnnouncementTemplate(parentName: string, _allEmployees: boolean = false) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10A074 0%, #2F7A67 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎊 Wonderful News! 🎊</h1>
        </div>

        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <p style="font-size: 18px; margin-bottom: 20px;">Dear Team,</p>

          <p style="font-size: 16px; margin-bottom: 20px;">
            We're delighted to announce that <strong>${parentName}</strong> has welcomed a new baby! 👶
          </p>

          <p style="font-size: 16px; margin-bottom: 20px;">
            Please join us in congratulating ${parentName} and their family on this joyous occasion.
          </p>

          <p style="font-size: 16px; margin-bottom: 20px;">
            Let's celebrate this wonderful milestone together! 🎉
          </p>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #10A074;">
            <p style="font-size: 14px; color: #666; margin: 0;">
              Best regards,<br>
              <strong>DevOps Africa Welfare Fund</strong>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function marriageCongratulationsTemplate(employeeName: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10A074 0%, #2F7A67 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">💍 Congratulations! 💍</h1>
        </div>

        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <p style="font-size: 18px; margin-bottom: 20px;">Dear ${employeeName},</p>

          <p style="font-size: 16px; margin-bottom: 20px;">
            💝 Heartfelt congratulations on your marriage!
          </p>

          <p style="font-size: 16px; margin-bottom: 20px;">
            We're thrilled to celebrate this special moment with you. May your journey together be filled with love, laughter, and countless beautiful memories.
          </p>

          <p style="font-size: 16px; margin-bottom: 20px;">
            Wishing you both a lifetime of happiness and love! 💑
          </p>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #10A074;">
            <p style="font-size: 14px; color: #666; margin: 0;">
              With warmest wishes,<br>
              <strong>DevOps Africa Welfare Fund</strong>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function marriageAnnouncementTemplate(employeeName: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10A074 0%, #2F7A67 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">💝 Joyful News! 💝</h1>
        </div>

        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <p style="font-size: 18px; margin-bottom: 20px;">Dear Team,</p>

          <p style="font-size: 16px; margin-bottom: 20px;">
            We're delighted to share that <strong>${employeeName}</strong> has gotten married! 💍
          </p>

          <p style="font-size: 16px; margin-bottom: 20px;">
            Please join us in congratulating ${employeeName} as they begin this beautiful new chapter in their life.
          </p>

          <p style="font-size: 16px; margin-bottom: 20px;">
            Let's celebrate this wonderful occasion together! 🎉
          </p>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #10A074;">
            <p style="font-size: 14px; color: #666; margin: 0;">
              Best regards,<br>
              <strong>DevOps Africa Welfare Fund</strong>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function upcomingEventTemplate(eventTitle: string, eventType: string, eventDate: string, eventLocation?: string, eventDescription?: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10A074 0%, #2F7A67 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">📅 Upcoming Event</h1>
        </div>

        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <p style="font-size: 18px; margin-bottom: 20px;">Dear Team,</p>

          <p style="font-size: 16px; margin-bottom: 20px;">
            This is a reminder about an upcoming event:
          </p>

          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #10A074; margin-top: 0;">${eventTitle}</h2>
            <p style="margin: 10px 0;"><strong>Type:</strong> ${eventType}</p>
            <p style="margin: 10px 0;"><strong>Date:</strong> ${eventDate}</p>
            ${eventLocation ? `<p style="margin: 10px 0;"><strong>Location:</strong> ${eventLocation}</p>` : ''}
            ${eventDescription ? `<p style="margin: 10px 0;"><strong>Details:</strong> ${eventDescription}</p>` : ''}
          </div>

          <p style="font-size: 16px; margin-bottom: 20px;">
            We look forward to seeing you there!
          </p>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #10A074;">
            <p style="font-size: 14px; color: #666; margin: 0;">
              Best regards,<br>
              <strong>DevOps Africa Welfare Fund</strong>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function monthlySummaryTemplate(
  employeeName: string,
  month: string,
  year: number,
  totalContributions: number,
  totalExpenses: number,
  balance: number
) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10A074 0%, #2F7A67 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">📊 Monthly Summary</h1>
        </div>

        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <p style="font-size: 18px; margin-bottom: 20px;">Dear ${employeeName},</p>

          <p style="font-size: 16px; margin-bottom: 20px;">
            Here's your welfare fund summary for <strong>${month} ${year}</strong>:
          </p>

          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <div style="margin-bottom: 15px;">
              <p style="margin: 5px 0; color: #666;">Total Contributions:</p>
              <p style="margin: 0; font-size: 24px; color: #10A074; font-weight: bold;">GH₵${totalContributions.toFixed(2)}</p>
            </div>
            <div style="margin-bottom: 15px;">
              <p style="margin: 5px 0; color: #666;">Total Expenses:</p>
              <p style="margin: 0; font-size: 24px; color: #E63946; font-weight: bold;">GH₵${totalExpenses.toFixed(2)}</p>
            </div>
            <div style="border-top: 2px solid #10A074; padding-top: 15px;">
              <p style="margin: 5px 0; color: #666;">Current Balance:</p>
              <p style="margin: 0; font-size: 28px; color: ${balance >= 0 ? '#10A074' : '#E63946'}; font-weight: bold;">GH₵${balance.toFixed(2)}</p>
            </div>
          </div>

          <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
            Thank you for your continued participation in the welfare fund!
          </p>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #10A074;">
            <p style="font-size: 14px; color: #666; margin: 0;">
              Best regards,<br>
              <strong>DevOps Africa Welfare Fund</strong>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}
