/* ========= Shared helpers ========= */
function setYear() {
  var yEl = document.getElementById('yearNow');
  if (yEl) yEl.textContent = new Date().getFullYear();
}
function greetUser() {
  var name = localStorage.getItem('gt_user') || 'Traveler';
  var w = document.getElementById('welcomeName');
  if (w) w.textContent = name;
}
function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function isPhone(v) { return /^[+()0-9\s-]{7,}$/.test(v); }

/* ========= Core login logic (callable directly) ========= */
function handleLogin() {
  setYear();

  var user = $('#username');
  var pass = $('#password');

  if (!user.length || !pass.length) return;

  var okUser = user.val().trim().length > 0;
  var okPass = pass.val().trim().length >= 6;

  user.toggleClass('is-invalid', !okUser);
  pass.toggleClass('is-invalid', !okPass);

  if (!okUser || !okPass) return;

  var display = user.val().includes('@') ? user.val().split('@')[0] : user.val();
  display = display.charAt(0).toUpperCase() + display.slice(1);
  try { localStorage.setItem('gt_user', display); } catch (e) {}

  // Full page nav to avoid jQM Ajax
  window.location.href = 'home.html';
}

/* Bind login button safely */
function bindLogin() {
  var $btn = $('#loginBtn');
  if ($btn.length) $btn.off('click.gt').on('click.gt', handleLogin);
}

/* ========= Home binding ========= */
function bindHome() { greetUser(); }

/* ========= Booking helpers & logic ========= */
function setupBookingMinDate() {
  var $date = $('#travelDate');
  if ($date.length && !$date.attr('min')) {
    var t = new Date();
    var yyyy = t.getFullYear();
    var mm = String(t.getMonth() + 1).padStart(2, '0');
    var dd = String(t.getDate()).padStart(2, '0');
    $date.attr('min', `${yyyy}-${mm}-${dd}`);
  }
}

function handleBookingConfirm() {
  setupBookingMinDate();

  var name = $('#fullName');
  var email = $('#email');
  var phone = $('#phone');
  var dest = $('#destination');
  var date = $('#travelDate');
  var pax  = $('#pax');

  if (!(name.length && email.length && phone.length && dest.length && date.length && pax.length)) return;

  var t = new Date();
  var yyyy = t.getFullYear();

  var okName  = name.val().trim().length > 1;
  var okEmail = isEmail(email.val().trim());
  var okPhone = isPhone(phone.val().trim());
  var okDest  = dest.val().trim().length > 0;

  var dateVal = date.val();
  var okDate = false;
  if (dateVal) {
    var chosen = new Date(dateVal + 'T00:00:00');
    var now = new Date(yyyy, t.getMonth(), t.getDate());
    okDate = (chosen >= now);
  }

  var paxVal = parseInt(pax.val(), 10);
  var okPax = paxVal >= 1 && paxVal <= 10;

  name.toggleClass('is-invalid', !okName);
  email.toggleClass('is-invalid', !okEmail);
  phone.toggleClass('is-invalid', !okPhone);
  dest.toggleClass('is-invalid', !okDest);
  date.toggleClass('is-invalid', !okDate);
  pax.toggleClass('is-invalid', !okPax);

  if (!(okName && okEmail && okPhone && okDest && okDate && okPax)) return;

  // Fill popup
  $('#cName').text(name.val().trim());
  $('#cDest').text(dest.val().trim());
  $('#cDate').text(date.val());
  $('#cPax').text(paxVal);

  // Optional: store last booking
  try {
    localStorage.setItem('gt_last_booking', JSON.stringify({
      name: name.val().trim(),
      email: email.val().trim(),
      phone: phone.val().trim(),
      destination: dest.val().trim(),
      date: date.val(),
      pax: paxVal,
      notes: ($('#notes').val() || '').trim(),
      ts: new Date().toISOString()
    }));
  } catch (e) {}

  // Open jQM popup (with fallback if jQM missing)
  if (window.jQuery && $('#confirmPopup').length && $('#confirmPopup').popup) {
    $('#confirmPopup').popup('open');
  } else {
    alert('Booking confirmed for ' + name.val().trim() + ' to ' + dest.val().trim());
    window.location.href = 'home.html';
  }
}

/* Bind booking button safely */
function bindBooking() {
  var $btn = $('#confirmBtn');
  if ($btn.length) $btn.off('click.gt').on('click.gt', handleBookingConfirm);
}

/* ========= jQuery Mobile page events ========= */
if (window.jQuery) {
  $(document).on('pagecreate', '#loginPage', function () {
    setYear();
    bindLogin();
  });

  $(document).on('pagebeforeshow', '#homePage', function () {
    bindHome();
  });

  $(document).on('pagecreate', '#bookingPage', function () {
    setupBookingMinDate();
    bindBooking();
  });
}

/* ========= DOMContentLoaded fallback (works without jQM) ========= */
document.addEventListener('DOMContentLoaded', function () {
  setYear();
  setupBookingMinDate();
  bindLogin();
  bindHome();
  bindBooking();
});

/* Expose for inline onclick */
window.handleLogin = handleLogin;
window.handleBookingConfirm = handleBookingConfirm;
