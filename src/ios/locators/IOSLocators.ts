
export const IOSLocators = {

    // ==============================================
    // NAVIGATION
    // ==============================================
    navigation: {
        // SEMENTARA: perlu validasi di Appium Inspector.
        menuButton: '~test-Menu',

        // SEMENTARA: menu LOGIN pada drawer.
        loginMenu:
            '-ios predicate string:name == "LOGIN"'
    },

    // ==============================================
    // LOGIN
    // ==============================================
    login: {
        username: '~test-Username',
        password: '~test-Password',
        loginButton: '~test-LOGIN'
    },

    // ==============================================
    // PRODUCTS
    // ==============================================
    products: {
        title:
            '//XCUIElementTypeStaticText[@name="PRODUCTS"]',

        backpackName:
            '-ios predicate string:name == "Sauce Labs Backpack"',

        addBackpackToCart:
            '-ios class chain:**/XCUIElementTypeOther[`name == "test-ADD TO CART"`][1]',

        // Sesuai locator Inspector ketika cart berisi 1 item.
        cartWithOneItem:
            '-ios class chain:**/XCUIElementTypeOther[`name == "1"`][4]'
    },

    // ==============================================
    // CART
    // ==============================================
    cart: {
        title:
            '-ios class chain:**/XCUIElementTypeOther[`name == "YOUR CART"`]',

        checkoutButton: '~test-CHECKOUT',

        backpackName:
            '-ios predicate string:name == "Sauce Labs Backpack"'
    },

    // ==============================================
    // CHECKOUT
    // ==============================================
    checkout: {
        informationTitle:
            '-ios class chain:**/XCUIElementTypeOther[`name == "CHECKOUT: INFORMATION"`]',

        firstName: '~test-First Name',
        lastName: '~test-Last Name',
        postalCode: '~test-Zip/Postal Code',

        continueButton: '~test-CONTINUE',

        overviewTitle:
            '-ios class chain:**/XCUIElementTypeOther[`name == "CHECKOUT: OVERVIEW"`]',

        finishButton: '~test-FINISH',

        completeTitle:
            '-ios class chain:**/XCUIElementTypeOther[`name == "CHECKOUT: COMPLETE!"`]',

        backHomeButton: '~test-BACK HOME'
    }
} as const;
