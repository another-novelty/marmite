<?php

namespace App\Console\Commands\Generators;

use Illuminate\Console\GeneratorCommand;
use Illuminate\Support\Str;

class CreatePage extends GeneratorCommand
{
  /**
   * The console command name.
   *
   * @var string
   */
  protected $name = 'make:page {name}';

  /**
   * The console command description.
   *
   * @var string
   */
  protected $description = 'Create a new Page';

  /**
   * The type of class being generated.
   *
   * @var string
   */
  protected $type = 'Page';

  public function handle()
  {
    if (parent::handle() === false && ! $this->option('force')) {
      return false;
    }

    $this->call('make:cssmodule', ['name' => $this->argument('name')]);
  }

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

  /**
   * Get the stub file for the generator.
   *
   * @return string
   */
  protected function getStub()
  {
    return $this->resolveStubPath('/stubs/page.stub');
  }

  protected function getPath($name)
  {
    $name = str_replace($this->rootNamespace(), '', $name);
    return './resources/js/Pages/' . $name . '.tsx';
  }

  protected function buildClass($name)
  {
    $stub = file_get_contents($this->getStub());

    $name = Str::camel($this->argument('name'));

    $this->replacePageName($stub, Str::ucfirst($name))->replacePageClassName($stub, Str::lcfirst($name));
    return $stub;
  }

  protected function replacePageName(&$stub, $name)
  {
    $stub = str_replace('{{ pageName }}', $name, $stub);
    return $this;
  }

  protected function replacePageClassName(&$stub, $name)
  {
    $stub = str_replace('{{ pageClassName }}', $name, $stub);
    return $this;
  }
}
