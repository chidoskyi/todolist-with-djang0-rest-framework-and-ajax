$(document).ready(function() {
    console.log("jQuery is loaded and working!");

    // Disable the add button by default
    $('#add-btn').prop('disabled', true);

    // Enable/disable the add button based on input field content
    $('#search').on('input', function() {
        let inputVal = $(this).val().trim();
        $('#add-btn').prop('disabled', inputVal.length === 0);
    });
    // Fetch todos on page load if user is authenticated
    if (localStorage.getItem('accessToken')) {
        getTodos();  // Fetch todos only if access token is present
    }

    // Fetch todos on search input change
    $('#search-todo').on('input', function() {
        getTodos($(this).val().trim());
    });

    // Handle form submission for search
    $('#search-todo-form').on('submit', function(e) {
        e.preventDefault();
        let query = $('#search-todo').val().trim();
        getTodos(query);
    });

    // Handle filter change
    $('#select').on('change', function() {
        getTodos($('#search-todo').val().trim(), $(this).val());
    });

    // Clear search input
    $('#clear').on('click', function() {
        $('#search-todo').val('');
        $(this).hide();
        getTodos();
    });

    // Clear button for search input
    const $searchInput = $('#search');
    const $clearButton = $('#clears');
    $searchInput.on('input', function() {
        $clearButton.toggle($searchInput.val().trim() !== '');
    });
    $clearButton.on('click', function() {
        $searchInput.val('');
        $clearButton.hide();
        getTodos();
    });

    const $searchInputTodo = $('#search-todo');
    const $clearButtonTodo = $('#clear');
    $searchInputTodo.on('input', function() {
        $clearButtonTodo.toggle($searchInputTodo.val().trim() !== '');
    });
    $clearButtonTodo.on('click', function() {
        $searchInputTodo.val('');
        $clearButtonTodo.hide();
        getTodos();
    });

    // Check if the user is logged in
    if (localStorage.getItem('accessToken')) {
        $('#signin-link').hide();
        $('#logout-link').show();
    } else {
        $('#signin-link').show();
        $('#logout-link').hide();
    }

    // Check if the user is logged in
    if (localStorage.getItem('accessToken')) {
        let username = localStorage.getItem('username');
        $('#username-display').text(username); // Assuming you have an element with id 'username-display'
    }
});

// Function to get CSRF token value from the input field
function getCSRFToken() {
    return $('#csrf-token').val();
}

// Handle registration form submission
$('#registration-form').on('submit', function(e) {
    e.preventDefault(); // Prevent default form submission
    let formData = $(this).serialize(); // Serialize form data
    let url = "http://127.0.0.1:8001/api/register/";

    // Retrieve CSRF token
    let csrftoken = getCSRFToken();
    console.log('CSRF Token:', csrftoken); // Log CSRF token to console for debugging

    // Send AJAX request to register API endpoint
    $.ajax({
        url: url,
        method: 'POST',
        headers: {
            'X-CSRFToken': csrftoken, // Include CSRF token in headers
            'Cookie': getCookie('csrftoken'), // Include session cookie
        },
        data: formData,
        success: function(response) {
            // Handle successful registration response
            alert('Registered successfully');
            // Optionally, redirect to another page or perform additional actions
            window.location.href = "login.html"; // Redirect to login page after registration
        },
        error: function(xhr, status, error) {
            // Handle registration error
            alert('Registration failed: ' + error);
            console.error('Registration Error:', xhr.responseText); // Log detailed error message
        }
    });
});

// Function to retrieve cookie value by name
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


// Handle login form submission
$('#login-form').on('submit', function(e) {
    e.preventDefault(); // Prevent default form submission
    var formData = $(this).serialize(); // Serialize form data
    let url = "http://127.0.0.1:8001/api/login/";

    // Send AJAX request to your login API endpoint
    $.ajax({
        url: url,
        method: 'POST',
        data: formData,
        success: function(response) {
           // After successful login (example in your login success callback)
            localStorage.setItem('accessToken', response.access);
            localStorage.setItem('refreshToken', response.refresh);
            localStorage.setItem('username', response.username); // Assuming username is sent from backend

            // Log the username to the console for debugging
            console.log('Logged in username:', response.username);
            
            // Redirect to another page
            window.location.href = "todo.html"; // Change to your target URL
            // Toggle login/logout links
            $('#signin-link').hide();
            $('#logout-link').show();
            // Fetch todos after successful login
            getTodos();
        },
        error: function(xhr, status, error) {
            // Handle login error
            alert('Login failed: ' + error);
        }
    });
});

// Handle logout action
$('#logout-btn').on('click', function() {
    let url = "http://127.0.0.1:8001/api/logout/";
    let refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
        console.error('No refresh token found in localStorage');
        return;
    }

    // Data to be sent in the request body
    let requestData = { refresh: refreshToken };

    // Make authenticated request using makeAuthenticatedRequest function
    makeAuthenticatedRequest(url, 'POST', JSON.stringify(requestData), function(response) {
        // Clear tokens from local storage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        // Handle successful logout
        console.log('Logged out successfully');
        // Redirect to login page or perform any other action
        window.location.href = "registration.html"; // Change to your target URL
    }, function(xhr, status, error) {
        // Handle logout error
        console.error('Error logging out:', error);
        // Always clear tokens from local storage after attempting logout
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        // Redirect to login page even on error (optional)
        window.location.href = "registration.html"; // Change to your target URL
    });
});




function makeAuthenticatedRequest(url, method, data, successCallback, errorCallback) {
    let accessToken = localStorage.getItem('accessToken');
    $.ajax({
        url: url,
        method: method,
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        data: data,
        success: successCallback,
        error: function(xhr, status, error) {
            if (xhr.status === 401) {
                refreshToken(function() {
                    makeAuthenticatedRequest(url, method, data, successCallback, errorCallback);
                });
            } else {
                errorCallback(xhr, status, error);
            }
        }
    });
}

function refreshToken(callback) {
    let refreshToken = localStorage.getItem('refreshToken');
    $.ajax({
        url: 'http://127.0.0.1:8001/api/token/refresh/',
        method: 'POST',
        data: { refresh: refreshToken },
        success: function(response) {
            localStorage.setItem('accessToken', response.access);
            if (callback) callback();
        },
        error: function(xhr, status, error) {
            console.error('Error refreshing token:', error);
            alert('Session expired. Please log in again.');
            window.location.href = "registration.html"; // Redirect to login page
        }
    });
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
let csrftoken = getCookie('csrftoken');




let indicator = 0;
let item_id;

// Function to fetch todos based on query and filter
function getTodos(query = '', filter = '') {
    let url = 'http://127.0.0.1:8001/api/get-todos';

    if (query) {
        url = `http://127.0.0.1:8001/api/search/?search=${query}`;
    }

    if (filter) {
        url = `http://127.0.0.1:8001/api/search/?filter=${filter}`;
    }

    let wrapper = $('#sub-container');

    // Make authenticated request using makeAuthenticatedRequest function
    makeAuthenticatedRequest(url, 'GET', {}, function(response) {
        console.log('Todos:', response);

        // Clear the wrapper before appending todos
        wrapper.empty();

        response.forEach(function(d) {
            let listContainer = `
                <div class="task">
                    <div class="child">
                        <input type="checkbox" name="check" class="completed" id="completed_${d.id}" data-todo-id="${d.id}" ${d.completed ? 'checked' : ''}>
                        <span>${d.title}</span>
                        
                    </div>
                    <div class="icons">
                        <div class="icon editbtn" data-id="${d.id}" id="editbtn">
                            <i class="fas fa-pencil-square"></i>
                        </div>
                        <div class="icon delbtn" id="delbtn" data-id="${d.id}">
                            <i class="fa fa-trash" aria-hidden="true"></i>
                        </div>
                    </div>
                </div>
            `;
            wrapper.append(listContainer);

            // Fetch reactions for each todo
            // fetchReactions(d.id);
        });

        // Bind edit and delete button events
        bindEditAndDeleteEvents();

        // Bind change event for dynamic checkboxes
        bindCheckboxChangeEvent();
    }, function(xhr, status, error) {
        console.error('Error fetching todos:', error);
    });
}








// Function to bind edit and delete events to todos
function bindEditAndDeleteEvents() {
    $('.editbtn').each(function() {
        $(this).on('click', function() {
            let searchText = $('#search');
            item_id = $(this).data('id');
            let btnGrandParents = $(this).parents('.task');
            let grandParentsFc = btnGrandParents.find('.child span').text();
            searchText.val(grandParentsFc);
            if (searchText.val() == grandParentsFc) {
                indicator = 1;
                item_id = $(this).data('id');
            }
        });
    });

    $('.delbtn').each(function() {
        $(this).on('click', function() {
            let del_id = $(this).data('id');
            let url = `http://127.0.0.1:8001/api/delete-todo/${del_id}/`;
            makeAuthenticatedRequest(url, 'DELETE', {}, function(data) {
                console.log("Todo item deleted successfully");
                getTodos();  // Refresh the list after successful deletion
            }, function(xhr, status, error) {
                console.error('Error deleting todo item:', error);
            });
        });
    });
}

// Function to bind change event for checkbox (task completion status)
function bindCheckboxChangeEvent() {
    $('#sub-container').on('change', '.completed', function() {
        var todoId = $(this).data('todo-id');
        var completed = $(this).prop('checked');
        let url = `http://127.0.0.1:8001/api/completed/${todoId}/`;
        
        // Data to be sent in the request body
        let requestData = { 'check': completed };

        // Make authenticated request using makeAuthenticatedRequest function
        makeAuthenticatedRequest(url, 'PATCH', JSON.stringify(requestData), function(response) {
            console.log('Task completion status updated successfully');
        }, function(xhr, status, error) {
            console.error('Error updating task completion status:', error);
        });
    });
}
