<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTimeEntryRequest extends FormRequest
{

    protected function prepareForValidation(): void
    {
        $this->merge([
            "date_at" => $this->input("date_start"),
        ]);
    }
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            "date_at" => ["required", "date"],
            "minutes" => ["required", "integer"],
            "note" => ["nullable", "string"],
            "project_id" => ["nullable", "string", "exists:projects,id"],
            "service_id" => ["nullable", "string", "exists:services,id"],
            "mite_access_id" => ["required", "string", "exists:mite_accesses,id"],
        ];
    }
}
