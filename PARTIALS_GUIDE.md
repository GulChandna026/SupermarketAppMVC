# EJS Partials Guide

## What are Partials?

Partials are reusable template fragments that reduce code duplication. Instead of repeating the same code in every file, you create a partial once and include it everywhere.

## Partials Created

### 1. **Navbar Partial** (`views/partials/navbar.ejs`)
Contains the navigation bar with smart logic to show different links based on user role.

### 2. **Alerts Partial** (`views/partials/alerts.ejs`)
Displays error and success messages from flash data.

### 3. **Footer Partial** (`views/partials/footer.ejs`)
Contains the footer with links and copyright info.

### 4. **Head Partial** (`views/partials/head.ejs`)
Contains HTML head section with all CSS/JS links.

---

## How to Use Partials

### Basic Syntax in EJS:

```ejs
<%- include('partials/navbar') %>
```

**Note:** Use `<%-` (not `<%=`) to include partials. The dash tells EJS to output raw HTML without escaping.

---

## Example: Converting login.ejs with Partials

**OLD (Full code repetition):**
```ejs
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="/css/styles.css" rel="stylesheet">
  <title>Login</title>
</head>
<body>
  <nav class="navbar navbar-expand-sm navbar-dark">
    <!-- navbar code here -->
  </nav>

  <div class="container">
    <% if (errors && errors.length > 0) { %>
      <!-- error display code -->
    <% } %>
    <!-- form code -->
  </div>
</body>
</html>
```

**NEW (With Partials):**
```ejs
<%- include('partials/head', { title: 'Login - Supermarket App' }) %>

<%- include('partials/navbar') %>

<div class="container">
  <%- include('partials/alerts') %>
  
  <div class="row justify-content-center mt-5">
    <div class="col-md-6">
      <h2 class="page-title">🔐 Login</h2>
      
      <form action="/login" method="POST" class="mt-4">
        <div class="mb-3">
          <label for="email" class="form-label">📧 Email Address</label>
          <input type="email" id="email" name="email" class="form-control" required>
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">🔒 Password</label>
          <input type="password" id="password" name="password" class="form-control" required>
        </div>
        <button type="submit" class="btn btn-primary w-100">Login</button>
      </form>
    </div>
  </div>
</div>

<%- include('partials/footer') %>

</body>
</html>
```

---

## Passing Data to Partials

You can pass variables to partials:

```ejs
<%- include('partials/head', { title: 'My Custom Title' }) %>
```

Then in the partial (`head.ejs`):
```ejs
<title><%= typeof title !== 'undefined' ? title : 'Supermarket App' %></title>
```

---

## Benefits of Using Partials

✅ **DRY Principle** - Don't Repeat Yourself
✅ **Easier Maintenance** - Change navbar once, affects all pages
✅ **Cleaner Code** - Each file is more readable
✅ **Reusability** - Use same navbar for all pages
✅ **Consistency** - Ensures uniform design across app

---

## Quick Implementation Steps

1. **Create your partial** in `views/partials/` folder
2. **Include it** in other templates using `<%- include('partials/filename') %>`
3. **Pass data** if needed: `<%- include('partials/filename', { var: value }) %>`

That's it! You're using partials now.
