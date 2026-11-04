(function () {
  var btn = document.querySelector('.menu'), nav = document.getElementById('nav');
  if (btn && nav) btn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? 'Zatvori' : 'Izbornik';
  });
  document.querySelectorAll('form.form').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!f.reportValidity()) return;
      var s = f.querySelector('.sent'); if (s) s.hidden = false;
    });
  });
})();
