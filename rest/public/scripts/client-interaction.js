
class ClientInteraction{

    static GetUsers() {
        let result = '';

        $.ajax({
            url: "/api/users",
            type: "GET",
            contentType: "application/json",
            success: function (users) {
                let rows = "";
                $.each(users, function (index, user) {
                    // добавляем полученные элементы в таблицу
                    rows += row(user);
                });
                $("table tbody").append(rows);
            }
        });
    }

}

// function  getId(element) {
//    alert(element.parentNode.parentNode.rowIndex);
// }
// document.getElementById('IDIDIDIDIDIDID').innerHTML = html;
//$('#output').html(row);

// var userListData = [];
// DOM Ready =====
// $(document).ready(function() {
//     //populateTable();
//     //$('#userList table tbody').on('click',...., func);
// });
// ==============================================================
//     $('#userList table tbody').html(tableContent);
//////////////////////////
//  // Prevent Link from Firing
//     event.preventDefault();
////////////////////////
//Populate Info Box
// $('#userInfoName').text(thisUserObject.fullname);
//////////////////////////
// //  basic validation
// let errorCount = 0;
// $('#addUser input').each(function(index, val) {
//     if($(this).val() === '') { errorCount++; }
// });
// $.ajax({
//     type: 'POST',
//     data: newUser,
//     url: '/users/adduser',
//     dataType: 'JSON'
// }).done(function( response ) {
//
//     // Check for successful (blank) response
//     if (response.msg === '') {
//
//         // Clear the form inputs
//         $('#addUser fieldset input').val('');
//
//         // Update the table
//         populateTable();
//
//     }
//     else {
//
//         // If something goes wrong, alert the error message that our service returned
//         alert('Error: ' + response.msg);
//
//     }
// });
//    if(errorCount === 0) {}else{
//          alert('Please fill in all fields');
//    }
//
//
//     let confirmation = confirm('Are you sure you want to delete this user?');
//
//     // Check and make sure the user confirmed
//     if (confirmation === true) {}



// Получение одного пользователя
function GetUser(id) {
    $.ajax({
        url: "/api/users/"+id,
        type: "GET",
        contentType: "application/json",
        success: function (user) {
            let form = document.forms["userForm"];
            form.elements["id"].value = user.id;
            form.elements["name"].value = user.name;
            form.elements["age"].value = user.age;
        }
    });
}

// Добавление пользователя
function CreateUser(userName, userAge) {
    $.ajax({
        url: "api/users",
        contentType: "application/json",
        method: "POST",
        data: JSON.stringify({
            name: userName,
            age: userAge
        }),
        success: function (user) {
            reset();
            $("table tbody").append(row(user));
        }
    })
}
// Изменение пользователя
function EditUser(userId, userName, userAge) {
    $.ajax({
        url: "api/users",
        contentType: "application/json",
        method: "PUT",
        data: JSON.stringify({
            id: userId,
            name: userName,
            age: userAge
        }),
        success: function (user) {
            reset();
            $("tr[data-rowid='" + user.id + "']").replaceWith(row(user));
        }
    })
}

// function reset() {
//     let form = document.forms["userForm"];
//     form.reset();
//     form.elements["id"].value = 0;
// }

// Удаление пользователя
function DeleteUser(id) {
    $.ajax({
        url: "api/users/"+id,
        contentType: "application/json",
        method: "DELETE",
        success: function (user) {
            console.log(user);
            $("tr[data-rowid='" + user.id + "']").remove();
        }
    })
}

// $("#reset").click(function (e) {
//     e.preventDefault();
//     reset();
// });




