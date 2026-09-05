// This file will grow as we add more features (the real globe, live data, etc).
// For now it just marks the moment the splash animation finishes, so later
// we have a clear place to say "now show the main app".

const SPLASH_DURATION_MS = 4200; // matches the last animation finishing in style.css

window.addEventListener("DOMContentLoaded", () => {
  console.log("sonAr splash started");

  setTimeout(() => {
    console.log("sonAr splash finished — this is where we'll load the main globe next");
    // later: hide #splash and show the main app screen here
  }, SPLASH_DURATION_MS);
});
