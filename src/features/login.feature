Feature: Login aplikasi mobile swaglabs

@Login @Positive @Smoke @Retryable @FreshStart
Scenario: TC-LOGIN-001 - login dengan username dan password valid
    Given pengguna berada di halaman login
    When pengguna login menggunakan username "standard_user" dan password "secret_sauce"
    Then sistem menampilkan halaman PRODUCTS