<?php

namespace App\Console\Commands\Generators;

use Illuminate\Console\GeneratorCommand;
use Illuminate\Support\Str;

class CreateStub extends GeneratorCommand
{
  /**
   * The console command name.
   *
   * @var string
   */
  protected $name = 'make:stub {name}';

  /**
   * The console command description.
   *
   * @var string
   */
  protected $description = 'Create a new Stub';

  /**
   * The type of class being generated.
   *
   * @var string
   */
  protected $type = 'Stub';

  /**
   * Get the stub file for the generator.
   *
   * @return string
   */
  protected function getStub()
  {
    return __DIR__ . '/stubs/stub.stub';
  }

  /**
   * Create an empty stub file.
   */
  protected function buildClass($name)
  {
    return '';
  }

  /**
   * Override the path to the stubs.
   */
  protected function getPath($name)
  {
    $name = Str::replaceFirst($this->rootNamespace(), '', $name);
    return './stubs/' . $name . '.stub';
  }
}
