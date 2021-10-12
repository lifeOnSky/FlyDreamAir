$(document).ready(function () {

    var loginUser = "";
    getLoginUser();
    openIndexedDB();

    $("#login").on("click", () => {
        getUserInput();
    });

    var db;
    function openIndexedDB() {
        //create database
        var request = window.indexedDB.open("myDB", 1);

        request.onsuccess = function (e) {

            db = request.result;
            console.log(db);
            if (!db.objectStoreNames.contains('users')) {
                //set PK
                var objectStore = db.createObjectStore('users', { keyPath: 'userName' });
                console.log('done');
            }
            readAllTransaction();
            checkIsLogin()

        };

        request.onerror = function (event) {
            console.log(event);
        };

        request.onupgradeneeded = function (e) {
            db = request.result;
            console.log(db);

            if (!db.objectStoreNames.contains('users')) {
                var objectStore = db.createObjectStore('users', { keyPath: 'userName' });
                console.log('done');
            }

        };
    }

    //show all data
    function readAllTransaction() {

        var transaction = db.transaction("users", 'readwrite');

        var users = transaction.objectStore('users');


        users.openCursor().onsuccess = function (event) {
            var cursor = event.target.result;

            if (cursor) {

                console.log(cursor.value.userName);
                console.log(cursor.value.password);
                console.log(cursor.value.flight);
                cursor.continue();
            } else {

            }
        };


    }

    function getTransaction(username, userPassword) {


        var transaction = db.transaction("users", 'readwrite');
        var users = transaction.objectStore('users');

        var result = users.get(username);

        result.onsuccess = function (e) {

            var userObj = e.target.result;

            if (loginUser != "") {
                showResult(userObj.userName, userObj.flight);
                return;
            } else {
                try {
                    if (userObj.password != userPassword) {
                        $("#tableTitle").text("password is incorrect!").css({ "background-color": "red" });
                    } else {
                        //success
                        showResult(userObj.userName, userObj.flight);
                    }

                } catch (e) {
                    $("#tableTitle").text("User does not exist!").css({ "background-color": "red" });
                }

            }



        }

    }

    function getUserInput() {
        var userNname = $("#username").val();
        var password = $("#password").val()
        getTransaction(userNname, password);
    }

    //need obj
    function showResult(name, flight) {

        $("#outside").css({ "display": "none" });

        $("#resultTable").append("<div id='head'>" + name + "'s Flight Booking Information </div><br>")
        $.ajax({
            url: "/data/Australia.json",
            type: "get",
            dataType: "json",
            success: function (data) {

                $.each(flight, (index, value) => {

                    var flightInfo = data.filter((newdata) => {
                        return newdata.pk == value;
                    })
                    $("#resultTable").append(" <table  class='recommendationTable' border='0'>" +
                        "<tr>" +
                        "<td rowspan='2'><img class='airlineImg' src=\'" + flightInfo[0].airline_img + "\''></td>" +
                        "<td class='firstRowData'>" + flightInfo[0].airline + " </td>" +
                        "<td class='space'></td>" +
                        "<td class='firstRowData'>" + flightInfo[0].start_time + " </td>" +
                        "<td rowspan='2'><img class='arrow' src='/img/arrow.png'></td>" +
                        "<td class='firstRowData'>" + flightInfo[0].arrive_time + " </td>" +
                        "</tr>" +
                        "<tr>" +
                        "<td class='secondRowData'>seat type: " + flightInfo[0].class + " </td>" +
                        "<td class='space'></td>" +
                        "<td class='secondRowData'>" + flightInfo[0].starting_city + " </td>" +
                        "<td class='secondRowData'>" + flightInfo[0].destination + " </td>" +
                        "</tr>" +

                        "</table> <br>"

                    );

                })


            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert("404: please read read me file!");
            }


        })

        $("#resultTable").append("<button class='back1'>back</button>").ready(() => {

            $(".back1").on("click", () => {
                window.location = "/main.html? index=" + name;
            });


        })


    }

    function getLoginUser() {

        var reg = new RegExp("index=([^]*)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) {
            loginUser = r[1];


        } else {
            loginUser = "";
        }
    }

    function checkIsLogin() {
        if (loginUser != "") {
            getTransaction(loginUser, 0)
        }
    }

})