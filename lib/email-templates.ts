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

export function conferenceRoomBookingTemplate(
  roomName: string,
  bookingTitle: string,
  bookedBy: string,
  startDateTime: string,
  endDateTime: string,
  purpose?: string,
  description?: string,
  attendeeCount?: number
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
          <h1 style="color: white; margin: 0; font-size: 28px;">🏢 Conference Room Booked</h1>
        </div>

        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <p style="font-size: 18px; margin-bottom: 20px;">Dear Team,</p>

          <p style="font-size: 16px; margin-bottom: 20px;">
            A conference room has been booked. Please note the following details:
          </p>

          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #10A074; margin-top: 0; font-size: 22px;">${bookingTitle}</h2>

            <div style="margin-bottom: 12px;">
              <p style="margin: 5px 0; color: #666; font-size: 14px;">Conference Room:</p>
              <p style="margin: 0; font-size: 18px; color: #333; font-weight: bold;">${roomName}</p>
            </div>

            <div style="margin-bottom: 12px;">
              <p style="margin: 5px 0; color: #666; font-size: 14px;">Booked By:</p>
              <p style="margin: 0; font-size: 16px; color: #333;">${bookedBy}</p>
            </div>

            <div style="margin-bottom: 12px;">
              <p style="margin: 5px 0; color: #666; font-size: 14px;">Start Time:</p>
              <p style="margin: 0; font-size: 16px; color: #333; font-weight: 600;">📅 ${startDateTime}</p>
            </div>

            <div style="margin-bottom: 12px;">
              <p style="margin: 5px 0; color: #666; font-size: 14px;">End Time:</p>
              <p style="margin: 0; font-size: 16px; color: #333; font-weight: 600;">📅 ${endDateTime}</p>
            </div>

            ${purpose ? `
              <div style="margin-bottom: 12px;">
                <p style="margin: 5px 0; color: #666; font-size: 14px;">Purpose:</p>
                <p style="margin: 0; font-size: 16px; color: #333;">${purpose}</p>
              </div>
            ` : ''}

            ${description ? `
              <div style="margin-bottom: 12px;">
                <p style="margin: 5px 0; color: #666; font-size: 14px;">Description:</p>
                <p style="margin: 0; font-size: 14px; color: #555; line-height: 1.5;">${description}</p>
              </div>
            ` : ''}

            ${attendeeCount ? `
              <div style="margin-bottom: 12px;">
                <p style="margin: 5px 0; color: #666; font-size: 14px;">Expected Attendees:</p>
                <p style="margin: 0; font-size: 16px; color: #333;">👥 ${attendeeCount} people</p>
              </div>
            ` : ''}
          </div>

          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
            <p style="margin: 0; font-size: 14px; color: #856404;">
              ℹ️ <strong>Note:</strong> Please check the event calendar to avoid scheduling conflicts.
            </p>
          </div>

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

export function roomBookingApprovedTemplate(
  requesterName: string,
  roomName: string,
  bookingTitle: string,
  startDateTime: string,
  endDateTime: string,
  approverName: string
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
          <h1 style="color: white; margin: 0; font-size: 28px;">✅ Booking Approved</h1>
        </div>

        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <p style="font-size: 18px; margin-bottom: 20px;">Dear ${requesterName},</p>

          <p style="font-size: 16px; margin-bottom: 20px;">
            Great news! Your conference room booking has been <strong style="color: #10A074;">approved</strong>.
          </p>

          <div style="background: #d1fae5; border-left: 4px solid #10A074; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
            <h2 style="color: #065f46; margin-top: 0; font-size: 20px;">${bookingTitle}</h2>

            <div style="margin-bottom: 8px;">
              <p style="margin: 3px 0; color: #047857; font-size: 14px;">Conference Room:</p>
              <p style="margin: 0; font-size: 16px; color: #065f46; font-weight: bold;">${roomName}</p>
            </div>

            <div style="margin-bottom: 8px;">
              <p style="margin: 3px 0; color: #047857; font-size: 14px;">Start Time:</p>
              <p style="margin: 0; font-size: 16px; color: #065f46;">📅 ${startDateTime}</p>
            </div>

            <div style="margin-bottom: 8px;">
              <p style="margin: 3px 0; color: #047857; font-size: 14px;">End Time:</p>
              <p style="margin: 0; font-size: 16px; color: #065f46;">📅 ${endDateTime}</p>
            </div>

            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #10A074;">
              <p style="margin: 0; font-size: 14px; color: #047857;">Approved by: <strong>${approverName}</strong></p>
            </div>
          </div>

          <p style="font-size: 16px; margin-bottom: 20px;">
            Your booking is now confirmed. The room is reserved for your meeting at the scheduled time.
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

export function roomBookingRejectedTemplate(
  requesterName: string,
  roomName: string,
  bookingTitle: string,
  startDateTime: string,
  endDateTime: string,
  rejectionReason: string,
  approverName: string
) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">❌ Booking Rejected</h1>
        </div>

        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <p style="font-size: 18px; margin-bottom: 20px;">Dear ${requesterName},</p>

          <p style="font-size: 16px; margin-bottom: 20px;">
            Unfortunately, your conference room booking has been <strong style="color: #dc2626;">rejected</strong>.
          </p>

          <div style="background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
            <h2 style="color: #7f1d1d; margin-top: 0; font-size: 20px;">${bookingTitle}</h2>

            <div style="margin-bottom: 8px;">
              <p style="margin: 3px 0; color: #991b1b; font-size: 14px;">Conference Room:</p>
              <p style="margin: 0; font-size: 16px; color: #7f1d1d; font-weight: bold;">${roomName}</p>
            </div>

            <div style="margin-bottom: 8px;">
              <p style="margin: 3px 0; color: #991b1b; font-size: 14px;">Requested Start Time:</p>
              <p style="margin: 0; font-size: 16px; color: #7f1d1d;">📅 ${startDateTime}</p>
            </div>

            <div style="margin-bottom: 8px;">
              <p style="margin: 3px 0; color: #991b1b; font-size: 14px;">Requested End Time:</p>
              <p style="margin: 0; font-size: 16px; color: #7f1d1d;">📅 ${endDateTime}</p>
            </div>
          </div>

          <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
            <p style="margin: 5px 0; color: #78350f; font-size: 14px; font-weight: bold;">Reason for Rejection:</p>
            <p style="margin: 8px 0 0 0; font-size: 15px; color: #92400e; line-height: 1.6;">${rejectionReason}</p>
          </div>

          <p style="font-size: 14px; color: #666; margin-bottom: 8px;">
            Rejected by: <strong>${approverName}</strong>
          </p>

          <p style="font-size: 16px; margin-top: 20px; margin-bottom: 20px;">
            If you have any questions or would like to submit a new booking request, please contact the approver or try booking for a different time.
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
