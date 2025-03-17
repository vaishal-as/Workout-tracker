function popup(){
    var login=document.getElementById('login');
    var container=document.getElementById('container')
    login.style.display='block';
    container.style.display='none';
}
function popupc(){
    var login=document.getElementById('login');
    var container=document.getElementById('container')
    login.style.display='none';
    container.style.display='block';
}

function scrollToSection(sectionId) {
    var section = document.getElementById(sectionId);
    section.scrollIntoView({ behavior: 'smooth' });
  }
