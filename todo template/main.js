$(document).ready(function(){
    console.log("jQuery is loaded and working!");

    getTodos();

    // Disable the add button by default
    $('#add-btn').prop('disabled', true);

    // Enable/disable the add button based on input field content
    $('#search').on('input', function() {
        let inputVal = $(this).val().trim();
        if (inputVal.length > 0) {
            $('#add-btn').prop('disabled', false);
        } else {
            $('#add-btn').prop('disabled', true);
        }
    });
    

}); 

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
var csrftoken = getCookie('csrftoken');




let indicator = 0;
let item_id;

function getTodos() {
    let url = 'http://127.0.0.1:8001/api/get-todos';
    let wrapper = $('#sub-container');
    wrapper.empty();

    $.ajax({
        url: url,
        method: 'GET',
        success: function(data) {
            console.log(data);
            for (let d of data) {
                let listContainer = `
                    <div class="task">
                        <div class="child">
                            <input type="checkbox" name="check" class="check" ${d.completed ? 'checked' : ''}>
                            <span class="${d.completed ? 'strikethrough' : ''}">${d.title}</span>
                        </div>
                        <div class="icons">
                            <div class="icon editbtn" data-id="${d.id}">
                                <i class="fas fa-pencil-square"></i>
                            </div>
                            <div class="icon delbtn" data-id="${d.id}">
                                <i class="fa fa-trash" aria-hidden="true"></i>
                            </div>
                        </div>
                    </div>
                `;
                wrapper.append(listContainer);
            }

            attachEventListeners();
        },
        error: function(xhr, status, error) {
            console.log('Error fetching todos', status, error);
        }
    });
}
  

function attachEventListeners() {
    $('.editbtn').each(function() {
        $(this).on('click', function() {
            let btngrandParents = $(this).closest('.task');
            let grandParentFc = btngrandParents.find('.child span').text();
            console.log(grandParentFc);
            let input = $('#search');
            input.val(grandParentFc);
            if (input.val() === grandParentFc) {
                indicator = 1;
                item_id = $(this).data('id');
            }
        });
    });

    $('.delbtn').each(function() {
        $(this).on('click', function() {
            let todoId = $(this).data('id');
            delTodo(todoId);
        });
    });

    $('.check').each(function() {
        $(this).on('click', function() {
            let taskId = $(this).closest('.task').find('.editbtn').data('id');
            let url = `http://127.0.0.1:8001/api/complete-task/${taskId}/`;
            let span = $(this).siblings('span');
            let isChecked = $(this).is(':checked');
            if (isChecked) {
                span.addClass('strikethrough');
            } else {
                span.removeClass('strikethrough');
            }

            $.ajax({
                url: url,
                method: 'POST',
                headers: {
                    // 'X-CSRFToken': csrftoken,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: { 'check': isChecked ? 'true' : 'false' },
                success: function(response) {
                    console.log(response.status);
                },
                error: function(xhr, status, error) {
                    console.log('Error', status, error);
                }
            });
        });
    });
}

function delTodo(todoId) {
    let url = `http://127.0.0.1:8001/api/delete-todo/${todoId}/`;

    $.ajax({
        url: url,
        method: 'DELETE',
        success: function(response) {
            console.log('Todo deleted', response);
            getTodos(); // Refresh the list after deletion
        },
        error: function(xhr, status, error) {
            console.log('Error deleting todo', status, error);
        }
    });
}

$('#search-form').on('submit', function(e) {
    e.preventDefault();

    let searchText = $('#search').val(); // Get the value from the search input
    console.log(searchText);

    // Create the data object with the search text
    const data = { title: searchText };
    let url = 'http://127.0.0.1:8001/api/create-todo/';
    if (indicator === 1) {
        url = `http://127.0.0.1:8001/api/update-todo/${item_id}/`; // Add the trailing slash here
    }

    $.ajax({
        url: url,
        method: 'POST',
        contentType: 'application/json', // Set the correct content type
        headers: { 'X-CSRFToken': csrftoken }, // Set CSRF token header
        data: JSON.stringify(data), // Convert the data object to a JSON string
        success: function(response) {
            console.log('Success', response);
            getTodos(); // Directly call getTodos after successful creation

            // Clear the search text input
            $('#search').val('');
            if (searchText.val +=1  ) {
                let btn = $(this) 
            }
            indicator = 0; // Reset the indicator
        },
        error: function(xhr, status, error) {
            console.log('Error', status, error);
        }
    });
});