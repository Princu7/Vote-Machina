window.onload=function(){
    var test=document.getElementById("test");
    test.addEventListener('click',genericHandler,false);
}
function genericHandler(e){
    console.log("I am coming inside event handler");
    if(e.target!=e.currentTarget){
        if(e.target.id=="comuserid"){
            var url="http://localhost:8000/user/"+e.target.innerHTML;
            window.location.href=url;
        }
        else if(e.target.id=="comquesid"){
            var url="http://localhost:8000/pollquestion/"+e.target.innerHTML;
            window.location.href=url;
        }
    }
    e.stopPropagation();
}
