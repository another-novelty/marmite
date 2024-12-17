<?php

namespace App\Console\Commands;

use Illuminate\Console\GeneratorCommand;
use Illuminate\Support\Str;

class CreateGenerator extends GeneratorCommand
{
    protected $stubDirectory = 'stubs';

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'make:generator {name}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a new Generator';

    protected $type = 'Generator';

    protected function getDefaultNamespace($rootNamespace)
    {
        return $rootNamespace . '/Console/Commands/Generators';
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
                        : __DIR__.$stub;
    }

    /**
     * Get the stub file for the generator.
     *
     * @return string
     */
    protected function getStub()
    {
        return $this->resolveStubPath('/stubs/generator.stub');
    }

    protected function getNameInput()
    {
        return 'Create' . Str::ucfirst(parent::getNameInput());
    }

    public function handle()
    {
        $name = $this->argument('name');
        
        parent::handle();

        $this->createEmptyStub($name);
    }

    public function buildClass($name)
    {
        $objectName = Str::ucfirst(Str::camel($this->argument('name')));

        $name = $this->qualifyClass('Create' . $objectName);

        $commandName = 'make:' . strtolower($objectName) . ' {name}';

        $stub = parent::buildClass($name);

        $this->replaceCommandName($stub, $commandName)
            ->replaceClassType($stub, $objectName)
            ->replaceStubName($stub, strtolower($objectName));

        return $stub;
    }

    protected function replaceCommandName(&$stub, $name)
    {
        $stub = str_replace('{{ commandName }}', $name, $stub);

        return $this;
    }

    protected function replaceClassType(&$stub, $name)
    {
        $stub = str_replace('{{ classType }}', $name, $stub);

        return $this;
    }

    protected function replaceStubName(&$stub, $name)
    {
        $stub = str_replace('{{ stubName }}', $name, $stub);

        return $this;
    }

    /**
     * Create an empty stub file.
     */
    public function createEmptyStub($name)
    {
        $this->call('make:stub', ['name' => $name]);
    }
}
