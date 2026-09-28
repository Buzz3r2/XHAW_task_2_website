# Next Level Gaming & Esports Arena

A complete, static, twelve-page student website based on the supplied website wireframes and black/purple mobile design. Built with plain HTML, CSS and JavaScript. No npm installation, framework, build step or API key is required.

## Open in Visual Studio Code

1. Extract the ZIP.
2. Open the `next-level-website` folder in VS Code.
3. Serve the folder using VS Code's Live Server extension, or run:

```sh
python3 -m http.server 8000
```

On Windows, if `python3` is unavailable, use `py -m http.server 8000`.

4. Open `http://localhost:8000/index.html`.

Use a local server for reliable session storage across the pages. Double-clicking the HTML files lets you view the pages, but browser rules for file URLs can prevent the demo session from carrying between them.

## Demo sign-in

The Overview is the entry page. Choose Sign in and use the prefilled values:

- Email: `player@example.com`
- Demo password: `player123`

Any valid sample email and password of at least six characters works. Sign-up and sign-in are two tabs on the same page. Registration checks that the passwords match. Only the demo name, email and phone are stored in this tab's session; passwords are never saved or transmitted. Signing out clears this project's demo data.

## Upload to GitHub

Create an empty repository, then upload **the contents of this folder**, preserving the `assets` subfolders. `index.html` must be at the repository root.

You can upload files through GitHub's file-upload interface, or use the VS Code terminal:

```sh
git init
git add .
git commit -m "Add Next Level website"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

Replace the username/repository placeholders with your own values. These commands assume a new local folder and empty GitHub repository. If your lecturer already provided a group repository, clone that repository first and copy these files into it instead of creating another repository.

If you need a live site, enable GitHub Pages for the repository's `main` branch and root folder. All internal paths are relative, so the site also works under a repository subpath. Submit the repository link, and the published Pages link if requested.

## The twelve pages

| File | Screen |
| --- | --- |
| `index.html` | Overview and entry point |
| `account.html` | Sign in / Sign up |
| `home.html` | Homepage |
| `about.html` | About us |
| `plans.html` | Plans, packages and individual experiences |
| `venues.html` | Areas within the Johannesburg arena |
| `booking.html` | Booking selections and preferred date |
| `fees.html` | Calculate fees / simulated checkout |
| `confirmation.html` | Booking request or simulated payment confirmation |
| `my-bookings.html` | Demo booking history |
| `contact.html` | Contact information and directions |
| `faq.html` | Frequently asked questions |

Package details expand inside the Plans page to preserve the agreed twelve-page structure. There are no extra detail-page files. The separate footer wireframe is integrated into the homepage. Request and payment confirmations share one page.

## Files to customise

- `assets/css/style.css`: common layout, responsive styles, colours and typography.
- `assets/js/data.js`: seven packages/experiences, prices and contact settings.
- `assets/js/app.js`: account demo, navigation guards, validation, calculator and booking storage.
- `assets/images/`: the supplied gamer logo and arena/PC image crops from the supplied mobile reference.

All pictures are included locally. They are concept/reference imagery, not verified photos of the actual venue. The crops retain the resolution of the supplied reference; replace them with original full-resolution assets if available.

## Required contact details

The source brief gives Johannesburg but does not supply a verified phone number, email, social links or street address. These have not been invented. Update the final object in `assets/js/data.js`:

```js
window.NEXT_LEVEL_CONTACT = {
  phone: null,   // Replace with a quoted phone number.
  email: null,   // Replace with a quoted email address.
  address: null, // Replace with the full street address as a quoted string.
  social: []    // Example structure: [{ name: 'Instagram', url: 'https://...' }]
};
```

Once a real address is supplied, the contact page automatically displays an embedded Google map and a directions link. Map loading needs internet access. Email, phone and social links are created when real values are supplied. Until then, the page clearly identifies missing contact information.

## Fee calculation rules

The four gaming packages each cost R1 500. The three individual experiences each cost R750. The displayed item fees are before discount and VAT.

- 1 selected booking: no discount.
- 2 selected bookings: 5% discount.
- 3 selected bookings: 10% discount.
- 4 or more selected bookings: 15% discount.
- 15% VAT is added after applying the discount.

The chosen items are stored in an array. One selected package/experience counts as one booking. Attendees are enquiry information and do not multiply the package fee: the brief does not specify a per-attendee multiplier. All calculations use integer cents and round VAT to the nearest cent.

Example: Ultimate Gamer Pass + Virtual Reality Experience = R2 250.00 subtotal, R112.50 discount, R2 137.50 discounted subtotal, R320.63 VAT, **R2 458.13 total**.

## What works

- Navigation between all twelve pages.
- Sign-in/sign-up tabs, matching password validation and demo session handling.
- Protected home and booking pages, with return navigation after sign-in.
- Seven detailed offerings in the Plans page, expandable without adding pages.
- Dropdowns for venue area, pass, attendees, VIP and package.
- A required preferred date that rejects dates in the past on the Booking page.
- Name, phone and email checks, and at least one required item on the Fees page.
- Item selection array, discount tiers, 15% VAT and a quotation table.
- Stale quotation removal whenever the calculator form changes.
- Consultant-request and simulated-payment confirmations.
- Browser-session booking history.
- Responsive desktop and mobile layouts, keyboard focus styles, field labels and error messages.

## Demonstration boundaries

GitHub Pages serves static files. This project does not offer secure user authentication, real booking inventory, real payment processing or email delivery. Callback requests and payment confirmations are simulated and clearly labelled. No card information is collected. Demo details and booking records remain in this browser tab's `sessionStorage`; closing the tab can clear them. A live business version would require a secure backend and a payment provider.

The fee calculator produces a quote, not a final invoice. Actual availability, registration and payment must be confirmed by the business. Vision, mission and goals are proposed copy grounded in the supplied scenario.

## Submission review

Open and understand the code, replace the missing contact information, and follow your lecturer's requirements for your group repository and any AI-use disclosure. The project is not a substitute for checking your marking rubric: the agreed twelve-page version uses expandable detail sections; if the lecturer requires separate HTML detail pages for every offering, that requirement would increase the page count.

## Validation

JavaScript syntax, local file references, calculator totals, validation helpers and demo booking handlers were checked during packaging. A browser rendering test was unavailable in the creation environment; open the site through Live Server to review your own desktop/mobile screenshots before submitting.
