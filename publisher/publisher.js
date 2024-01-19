let mqttClient;

window.addEventListener("load", (event) => {
  connectToBroker();

  const topicInput = document.querySelector("#chosenBot");
  const listItems = document.querySelectorAll(".form-row-robot label");

  const changeMaxSpeed = document.querySelector('#button');
  changeMaxSpeed.addEventListener("click", function () {
    changeRobotMaxSpeed();
  });

  const systemFailureButton = document.querySelector('.dot');
  systemFailureButton.addEventListener("click", function () {
    systemFailure();
  });

  listItems.forEach(function(item) {
    item.addEventListener("click",function(event) {
      const listId = event.target.parentElement.id;
      topicInput.value = listId;
  });
  });
});

var antalganger = 0;
var tid;
const tider = [];
var wrapper = document.querySelector('.robotWrapper');
var robots = [];

function connectToBroker() {
  const clientId = "client" + Math.random().toString(36).substring(7);

  // Change this to point to your MQTT broker
  const host = "ws://broker.emqx.io:8083/mqtt";
  //const host = "ws://10.0.20.114:9001/mqtt";


  const options = {
    keepalive: 60,
    clientId: clientId, 
    protocolId: "MQTT",
    protocolVersion: 5,
    clean: true,
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000,
  };

  mqttClient = mqtt.connect(host, options);
  mqttClient.subscribe("andel1337", { qos: 0 });

  mqttClient.on("error", (err) => {
    console.log("Error: ", err);
    mqttClient.end();
  });

  mqttClient.on("reconnect", () => {
    console.log("Reconnecting...");
  });

  mqttClient.on("connect", () => {
    console.log("Client connected:" + clientId);
  });

  // Received
  mqttClient.on("message", (topic, message, packet) => {
    const obj = JSON.parse(message);
    //console.log(obj);
    //console.log(obj.Topic);
    var noRobotExists = true;
    robots.forEach(function(machine) {
      if(Number(machine.Topic) == Number(obj.Robot)){
        machine.Speed = obj.Speed;
        if(obj.Speed == 0){
          machine.Status = "OFF";
        } else {
          machine.Status = "ON";
        }
        noRobotExists = false;
        updatelist();
      }

    })


    if(noRobotExists){
     console.log("NEW ROBOT ADDED") 
     var newRobot = {Topic : obj.Robot, Type: 'R-1000', Status: 'OFF', Speed: obj.Speed};
     robots.push(newRobot);
     updatelist();
    }
  });
}

function changeRobotMaxSpeed(){
  const systemFailureButton = document.querySelector('.dot');
  if(systemFailureButton.classList.contains("active"))
    return;
  const messageInput = document.querySelector("#message").value.trim();
  const topicInput = document.querySelector("#chosenBot").value.trim();
  tid = Date.now()
   var robot = {
      Type : topicInput,
      Speed : messageInput,
    }
    console.log(robot);
  mqttClient.publish("andel1", JSON.stringify(robot), {
    qos: 0,
    retain: false,
  });
}  

function systemFailure(){
  const systemFailureButton = document.querySelector('.dot');
  if(systemFailureButton.classList.contains("active")){
    console.log("clear");
    systemFailureButton.classList.remove("active")
    systemFailureButton.classList.add("disabled");


    robots.forEach(function(machine){

      var robot = {
        Type : machine.Topic,
        Failure : false,
      }
  
      mqttClient.publish("andel1", JSON.stringify(robot), {
        qos: 0,
        retain: false,
      });

    })
    var robot = {
      Failure : false,
    }

    mqttClient.publish("andel420", JSON.stringify(robot), {
      qos: 0,
      retain: false,
    });

  } else {
    systemFailureButton.classList.remove("disabled")
    systemFailureButton.classList.add("active");

    robots.forEach(function(machine){

      var robot = {
        Type : machine.Topic,
        Failure : true,
      }
  
      mqttClient.publish("andel1", JSON.stringify(robot), {
        qos: 0,
        retain: false,
      });

    })
    var robot = {
      Failure : true,
    }

    mqttClient.publish("andel420", JSON.stringify(robot), {
      qos: 0,
      retain: false,
    });
  }
}

function updatelist(){
  var wrapper = document.querySelector('.robotWrapper');

  ///denna delatar listan
  while(wrapper.firstChild){
    wrapper.removeChild(wrapper.firstChild);
  }

  robots.forEach(function(robot,index){
    var robotLi = document.createElement('Li');
    robotLi.className = 'form-row-robot';
    robotLi.id = robot.Topic;
  
    var robotHtml = `
      <label for="topic">${robot.Topic}</label>
      <label class="type">${robot.Type}</label>
      <label class="status">${robot.Status}</label>
      <label class="speed">${robot.Speed}</label>
    `;
  
    robotLi.innerHTML = robotHtml;
    wrapper.appendChild(robotLi);
  })
  const topicInput = document.querySelector("#chosenBot");
  const listItems = document.querySelectorAll(".form-row-robot label");

  listItems.forEach(function(item) {
    item.addEventListener("click",function(event) { 
      const listId = event.target.parentElement.id;
      topicInput.value = listId;
  });
  });

}

function clearList(){
  robots.forEach(function(machine) {
    if(machine.Speed == 0){
      console.log(machine.Topic);
      robots.splice(robots.findIndex(a => a.Topic == machine.Topic),1);
    }
    updatelist();
  })
}

/*
setInterval(function(){
  //clearList()
  tid = Date.now()
  var robot = {
    Type : 569,
    Antal: antalganger++
  }

  mqttClient.publish("andel1", JSON.stringify(robot), {
    qos: 0,
    retain: false,
  });

  if(tider.length === 100){
    console.log(tider);
  }
},5000)

*/