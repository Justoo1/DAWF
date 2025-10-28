import prisma from '@/lib/prisma'

const welfarePolicyContent = `
<div class="policy-document">
  <h1 style="color: #047857; font-size: 2rem; font-weight: bold; margin-bottom: 1rem; text-align: center;">
    DEVOPS AFRICA LIMITED
  </h1>
  <h2 style="color: #047857; font-size: 1.5rem; font-weight: bold; margin-bottom: 2rem; text-align: center; border-bottom: 2px solid #047857; padding-bottom: 0.5rem;">
    CONSTITUTION - WELFARE FUND FOR STAFF
  </h2>

  <section style="margin-bottom: 2rem;">
    <h3 style="color: #047857; font-size: 1.25rem; font-weight: bold; margin-bottom: 0.75rem;">1.0 INTRODUCTION</h3>
    <p style="line-height: 1.6; margin-bottom: 1rem;">
      DevOps Africa staff have established a welfare fund named DevOps Africa Welfare Funds (DAWF) (hereinafter referred to as 'Fund'). The address will be c/o DevOps Africa Limited 289 CFC Estate Dome, Accra - Accra.
    </p>
  </section>

  <section style="margin-bottom: 2rem;">
    <h3 style="color: #047857; font-size: 1.25rem; font-weight: bold; margin-bottom: 0.75rem;">2.0 OBJECTIVES</h3>
    <p style="line-height: 1.6; margin-bottom: 1rem;">The objectives of the Fund are:</p>
    <p style="line-height: 1.6; margin-bottom: 0.5rem;">To support members in times of celebrations and bereavement. The support include:</p>
    <ul style="list-style-type: disc; margin-left: 2rem; line-height: 1.8;">
      <li>Donations to staff members when they are bereaved</li>
      <li>Staff Demise - Donation to family</li>
      <li>The Celebration of the birth of a child of a member</li>
      <li>The Celebration of the birthdays of staff members</li>
      <li>Wedding Celebration</li>
      <li>Graduations / Awards</li>
      <li>Other benefits: Visitations to members when hospitalized, send of gifts etc.</li>
    </ul>
  </section>

  <section style="margin-bottom: 2rem;">
    <h3 style="color: #047857; font-size: 1.25rem; font-weight: bold; margin-bottom: 0.75rem;">3.0 MEMBERSHIP</h3>
    <p style="line-height: 1.6; margin-bottom: 1rem;">
      All employees permanent of DevOps Africa shall be Members of the Fund.
    </p>
  </section>

  <section style="margin-bottom: 2rem;">
    <h3 style="color: #047857; font-size: 1.25rem; font-weight: bold; margin-bottom: 0.75rem;">4.0 INVESTMENT ACCOUNT AND SIGNATORIES</h3>
    <p style="line-height: 1.6; margin-bottom: 1rem;">
      The Fund will open an investment account with an agreed bank in the name of the Fund. The signatories to the Fund shall be Chairman, Secretary, Treasurer and an Ex-Officio member.
    </p>
  </section>

  <section style="margin-bottom: 2rem;">
    <h3 style="color: #047857; font-size: 1.25rem; font-weight: bold; margin-bottom: 0.75rem;">5.0 INVESTMENTS</h3>
    <p style="line-height: 1.6; margin-bottom: 1rem;">
      The Funds shall be invested in a short-term unit trust or any other investment that the Members may decide on from time to time.
    </p>
  </section>

  <section style="margin-bottom: 2rem;">
    <h3 style="color: #047857; font-size: 1.25rem; font-weight: bold; margin-bottom: 0.75rem;">6.0 SOURCES OF FUNDS</h3>
    <ul style="list-style-type: disc; margin-left: 2rem; line-height: 1.8;">
      <li>Monthly contributions of GHS100.00 per member (to be reviewed as and when necessary)</li>
      <li>Interest accrued on investments</li>
      <li>Donations</li>
    </ul>
  </section>

  <section style="margin-bottom: 2rem;">
    <h3 style="color: #047857; font-size: 1.25rem; font-weight: bold; margin-bottom: 0.75rem;">7.0 BENEFITS</h3>
    <p style="line-height: 1.6; margin-bottom: 1rem;">
      Members shall be eligible for benefits provided they have contributed for a period of not less than 4 months. Members in good standing shall qualify for benefits under the following events:
    </p>

    <h4 style="color: #059669; font-size: 1.1rem; font-weight: 600; margin: 1rem 0 0.5rem; margin-left: 1rem;">7.1 Donation to Family/Next of kin in the event of a Loss of a member:</h4>
    <ul style="list-style-type: disc; margin-left: 3rem; line-height: 1.8;">
      <li>Member – Amount to donate should a member die – GHS 100 * total number of members</li>
    </ul>

    <h4 style="color: #059669; font-size: 1.1rem; font-weight: 600; margin: 1rem 0 0.5rem; margin-left: 1rem;">7.2 Loss of immediate Relative of a member:</h4>
    <p style="line-height: 1.6; margin-bottom: 0.5rem; margin-left: 3rem;">Where immediate relative shall mean:</p>
    <ul style="list-style-type: disc; margin-left: 3rem; line-height: 1.8;">
      <li>Parent - GHS 1,500</li>
      <li>Spouse – GHS 2,000</li>
      <li>Child (Adopted or Biological) - GHS 2,000</li>
    </ul>

    <h4 style="color: #059669; font-size: 1.1rem; font-weight: 600; margin: 1rem 0 0.5rem; margin-left: 1rem;">7.3 Celebrations</h4>

    <div style="margin-left: 2rem; margin-bottom: 1rem;">
      <p style="font-weight: 600; margin-bottom: 0.5rem;">Birthdays:</p>
      <ul style="list-style-type: disc; margin-left: 1rem; line-height: 1.8;">
        <li>There shall be an office party for the members of staff who had birthdays within the day. Amount of GHS 650 will be allocated.</li>
        <li>Celebration will be held at the end of the month.</li>
      </ul>
    </div>

    <div style="margin-left: 2rem; margin-bottom: 1rem;">
      <p style="font-weight: 600; margin-bottom: 0.5rem;">Childbirth or Adoption by a member:</p>
      <p style="margin-bottom: 0.5rem;">The Welfare shall buy gifts or cash donations in the case of multiple births (e.g., twins, triplets, etc) at the same time.</p>
      <ul style="list-style-type: disc; margin-left: 1rem; line-height: 1.8;">
        <li>Adopted – GHS 1,500</li>
        <li>Biological – GHS 2,000</li>
      </ul>
    </div>

    <div style="margin-left: 2rem; margin-bottom: 1rem;">
      <p style="font-weight: 600; margin-bottom: 0.5rem;">Wedding by a member:</p>
      <p>The welfare shall give a donation of GHS 3,000</p>
    </div>

    <h4 style="color: #059669; font-size: 1.1rem; font-weight: 600; margin: 1rem 0 0.5rem; margin-left: 1rem;">7.4 Other Benefits</h4>
    <p style="line-height: 1.6; margin-bottom: 0.5rem; margin-left: 2rem;">The Welfare shall thus provide assistance as follows:</p>
    <ul style="list-style-type: disc; margin-left: 3rem; line-height: 1.8;">
      <li><strong>Hospital visitation items - GHS 500:</strong> For a staff member who is hospitalized, the welfare shall donate and pay a visit to the member in the hospital. Items donated should be worth GHS 350.00.</li>
      <li><strong>Any other welfare assistance:</strong> Amount will be determined, but not exceeding a member's one-year total contribution per member.</li>
    </ul>
  </section>

  <section style="margin-bottom: 2rem;">
    <h3 style="color: #047857; font-size: 1.25rem; font-weight: bold; margin-bottom: 0.75rem;">8.0 DOCUMENTATION</h3>
    <p style="line-height: 1.6; margin-bottom: 0.5rem;"><strong>8.1</strong> A member will acknowledge via email upon receipt of welfare donation or assistance.</p>
    <p style="line-height: 1.6; margin-bottom: 1rem;"><strong>8.2</strong> All receipts of purchases shall be forwarded to the Treasurer for safe custody.</p>
  </section>

  <section style="margin-bottom: 2rem;">
    <h3 style="color: #047857; font-size: 1.25rem; font-weight: bold; margin-bottom: 0.75rem;">9.0 APPOINTMENT OF OFFICIALS/TRUSTEES</h3>
    <ul style="list-style-type: disc; margin-left: 2rem; line-height: 1.8; margin-bottom: 1rem;">
      <li>Chairman (Emmanuel)</li>
      <li>Secretary (Philemon, Obed)</li>
      <li>Treasurer (Justice, Alberta)</li>
      <li>Ex-Officio / Observer (Leslie)</li>
    </ul>
    <p style="line-height: 1.6; margin-bottom: 0.5rem;"><strong>9.1</strong> All officials shall be elected by a simple majority of at least 8 members present.</p>
    <p style="line-height: 1.6; margin-bottom: 1rem;"><strong>9.2</strong> There shall be three officials to administer the fund of which one shall be the treasurer. The treasurer shall be responsible for the day-to-day collections and disbursement of funds under the provisions of this constitution.</p>
  </section>

  <section style="margin-bottom: 2rem;">
    <h3 style="color: #047857; font-size: 1.25rem; font-weight: bold; margin-bottom: 0.75rem;">10.0 SEPARATION</h3>
    <p style="line-height: 1.6; margin-bottom: 0.5rem;">A member shall be deemed separated from the group through the following circumstances:</p>
    <ul style="list-style-type: disc; margin-left: 2rem; line-height: 1.8; margin-bottom: 1rem;">
      <li>Retirement</li>
      <li>Exit from the organization</li>
      <li>Death</li>
    </ul>
    <p style="line-height: 1.6; margin-bottom: 1rem;">
      Upon Separation, a contributor shall cease immediately to be a Member under this Regulation and shall not benefit from the Fund except for a send-off gift in the case of retirement or resignation.
    </p>
  </section>

  <section style="margin-bottom: 2rem;">
    <h3 style="color: #047857; font-size: 1.25rem; font-weight: bold; margin-bottom: 0.75rem;">11.0 AMENDMENT</h3>
    <p style="line-height: 1.6; margin-bottom: 1rem;">
      To make any amendments, a quorum of 2/3 of the membership should be present with a simple majority being in favor of the proposed amendment.
    </p>
  </section>

  <section style="margin-bottom: 2rem;">
    <h3 style="color: #047857; font-size: 1.25rem; font-weight: bold; margin-bottom: 0.75rem;">12.0 DISCIPLINE</h3>
    <p style="line-height: 1.6; margin-bottom: 1rem;">
      All members of the Fund shall abide by the provisions of the Fund Rules, conduct themselves as disciplined members and maintain the spirit of teamwork and collective responsibility.
    </p>
    <p style="line-height: 1.6; margin-bottom: 1rem;">
      If a member fails to contribute, the outstanding contributions will be deducted from the donation or entitled benefit as listed above or the member would have to be in good standing to benefit.
    </p>
  </section>

  <section style="margin-bottom: 2rem; background-color: #f0fdf4; padding: 1rem; border-left: 4px solid #047857;">
    <h4 style="color: #047857; font-size: 1.1rem; font-weight: bold; margin-bottom: 0.75rem;">NOTE:</h4>
    <p style="line-height: 1.6; margin-bottom: 0.5rem;">
      A member (seconded by another member) can raise an issue or propose a revision at a general meeting or where it is an emergency, raise it with the chairman directly.
    </p>
    <p style="line-height: 1.6;">
      This constitution will be revised and adjusted by a majority vote (70%) to reflect the interests or needs of DAWF.
    </p>
  </section>
</div>
`

async function seedPolicy() {
  try {
    // Check if policy already exists
    const existingPolicy = await prisma.policy.findUnique({
      where: { slug: 'welfare-fund-constitution' }
    })

    if (existingPolicy) {
      console.log('Policy already exists. Updating...')
      const updated = await prisma.policy.update({
        where: { slug: 'welfare-fund-constitution' },
        data: {
          title: 'Welfare Fund Constitution',
          content: welfarePolicyContent,
          updatedBy: 'system',
          version: existingPolicy.version + 1,
        }
      })
      console.log('Policy updated successfully:', updated.id)
    } else {
      console.log('Creating new policy...')
      const created = await prisma.policy.create({
        data: {
          title: 'Welfare Fund Constitution',
          slug: 'welfare-fund-constitution',
          content: welfarePolicyContent,
          updatedBy: 'system',
          isActive: true,
        }
      })
      console.log('Policy created successfully:', created.id)
    }
  } catch (error) {
    console.error('Error seeding policy:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedPolicy()