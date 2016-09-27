window.onload=function(){
    var selector=document.getElementById("selector");
    console.log(selector);
    selector.addEventListener("click",handler,false);
}
function handler(e){
    console.log("I am coming inside handler");
    if(e.target!=e.currentTarget){
        var url="http://localhost:8000/pollquestion/"+e.target.innerHTML;
        console.log(url);
        window.location.href=url;
    }
}
