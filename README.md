# Marmite Project

Welcome to the Marmite project! This README will guide you through the setup and configuration process.

## Getting Started

To get started with the Marmite project, follow these steps:

### Prerequisites

Make sure you have the following installed:
- [PHP](https://www.php.net/)
- [Composer](https://getcomposer.org/)
- [Laravel](https://laravel.com/)

### Installation

1. Clone the repository:
  ```sh
  git clone https://github.com/yourusername/marmite.git
  cd marmite
  ```

2. Install the dependencies:
  ```sh
  composer install
  ```

### Environment Configuration

Before running the project, you need to create and configure the `.env` file.

1. Create a `.env` file in the root directory of the project:
  ```sh
  cp .env.example .env
  ```

2. Open the `.env` file and add the necessary environment variables. For example:
  ```env
  DB_CONNECTION=mysql
  DB_HOST=127.0.0.1
  DB_PORT=3306
  DB_DATABASE=your_database
  DB_USERNAME=your_username
  DB_PASSWORD=your_password
  ```

Make sure to replace `your_database`, `your_username`, and `your_password` with your actual configuration values.

3. Generate an application key:
  ```sh
  php artisan key:generate
  ```

### Running the Project

To start the project, run:
```sh
php artisan serve
```

## Contributing

We welcome contributions! Please read our [contributing guidelines](CONTRIBUTING.md) for more information.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
### Using Laravel Sail

Laravel Sail provides a simple command-line interface for interacting with Laravel's default Docker configuration.

1. Start the Docker containers:
  ```sh
  ./vendor/bin/sail up
  ```

2. Run the project:
  ```sh
  ./vendor/bin/sail artisan serve
  ```

For more information on Laravel Sail, refer to the [official documentation](https://laravel.com/docs/8.x/sail).
