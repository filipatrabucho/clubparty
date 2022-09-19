navbar = document.querySelector(".navbar").querySelectorAll("a");

navbar.forEach((element) => {
  element.addEventListener("click", function () {
    navbar.forEach((nav) => nav.classList.remove("active"));

    this.classList.add("active");
  });
});

window.addEventListener("scroll", function () {
  var header = document.querySelector(".navbar");
  header.classList.toggle("sticky", window.scrollY > 0);
});
