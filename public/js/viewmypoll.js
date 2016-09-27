window.onload=function(){
    var select=document.getElementById("selector");
    console.log(select);
    select.addEventListener("click",handler,false);
};

function handler(e){
    console.log("Inside event handler");
    if(e.target!=e.currentTarget){
        if(e.target.id=="comquesid"){
            var url="http://localhost:8000/pollquestion/"+e.target.innerHTML;
            console.log(url);
            window.location.href=url;
        }
        else if(e.target.id=="comdeleteid"){
            var child=e.target.parentElement.parentElement;
            var ques=e.target.parentElement.parentElement.childNodes[0].childNodes[0].innerHTML;
            var url="http://localhost:8000/delete/"+ques;
            console.log(url);
            child.parentNode.removeChild(child);
            var xhr=new XMLHttpRequest();
            xhr.open("GET",url,true);
            xhr.send(null);
            xhr.onload=function(e){
                console.log("request for update sent");
                if(xhr.readyState===4){
                    console.log("ready state is 4");
                    if(xhr.status===200){
                        console.log("status is 200");
                        console.log("updation done successfully");
                        }
                }
            };
        }
        else if(e.target.id=="commodifyid"){
            var ques=e.target.parentElement.parentElement.childNodes[0].childNodes[0].innerHTML;
            var url="http://localhost:8000/modify/"+ques;
            console.log(url);
            window.location.href=url;
        }
    }
    e.stopPropagation();
}
