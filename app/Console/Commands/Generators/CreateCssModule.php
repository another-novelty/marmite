<?php

namespace App\Console\Commands\Generators;

use Illuminate\Console\GeneratorCommand;
use Illuminate\Support\Str;

class CreateCssModule extends GeneratorCommand
{
  /**
   * The console command name.
   *
   * @var string
   */
  protected $name = 'make:cssmodule {name}';

  /**
   * The console command description.
   *
   * @var string
   */
  protected $description = 'Create a new CssModule';

  /**
   * The type of class being generated.
   *
   * @var string
   */
  protected $type = 'CssModule';

  /**
   * Resolve the fully-qualified path to the stub.
   *
   * @param  string  $stub
   * @return string
   */
  protected function resolveStubPath($stub)
  {
    return file_exists($customPath = $this->laravel->basePath(trim($stub, '/')))
      ? $customPath
      : __DIR__ . $stub;
  }

  protected function getPath($name)
  {
    $name = str_replace($this->rootNamespace(), '', $name);
    return './resources/js/Pages/' . $name . '.module.css';
  }

  /**
   * Get the stub file for the generator.
   *
   * @return string
   */
  protected function getStub()
  {
    return $this->resolveStubPath('/stubs/cssModule.stub');
  }

  protected function buildClass($name)
  {
    $stub = file_get_contents($this->getStub());

    $name = Str::lcfirst(Str::camel($this->argument('name')));

    $this->replacePageComponent($stub, $name);

    return $stub;
  }

  protected function replacePageComponent($stub, $name)
  {
    $stub = str_replace('{{ pageComponent }}', $name, $stub);
    return $this;
  }
}