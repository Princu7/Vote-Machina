window.onload=function(){
    console.log("inside onloaded document");
    var tab=document.getElementById("optiontable");
    console.log(tab);
    tab.addEventListener("click",delHandler,false);
    var but=document.getElementById("addoption");
    but.addEventListener("click",addoption,false);
    console.log(but);
}

function delHandler(e){
    console.log(e.target.id);
    console.log(e.currentTarget.id);
    if(e.target!=e.currentTarget){
        if(e.target.id==="comdeleteid"){
            var option=e.target.parentElement.parentElement.childNodes[0].innerHTML;
            console.log(option);
            var ques=decodeURI(window.location.href).split('/')[4];
            console.log(ques);
            var child=e.target.parentNode.parentNode;
            console.log(child);
            child.parentNode.removeChild(child);
            var xhr=new XMLHttpRequest();
            var url="/optiondelete/"+ques+"/"+option;
            console.log(url);
            xhr.open("GET",url,true);
            xhr.send(null);
            xhr.onload=function(e){
                console.log("request for update sent");
                if(xhr.readyState===4){
                    console.log("ready state reached four");
                    if(xhr.status===200){
                        console.log("status is 200");
                    }
                }
            }
        }
    }
    e.stopPropagation();
}
function addoption(){
    console.log("I am coming here");
    var formElem=document.getElementById("myform");
    console.log("this is form");
    console.log(formElem);
    var request=new XMLHttpRequest();
    var formData = new FormData(formElem);
    console.log("this is formdata");
    console.log(formData);
    request.open("POST","/nothing",true);
    request.send(formData);
}
