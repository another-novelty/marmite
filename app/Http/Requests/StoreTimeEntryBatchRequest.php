<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTimeEntryBatchRequest extends FormRequest
{
    protected function prepareForValidation()
    {
        // reorder dates if needed
        if ($this->date_start > $this->date_end) {
            $this->merge([
                "date_start" => $this->date_end,
                "date_end" => $this->date_start,
            ]);
        }
    }
    
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'mite_access_id' => ['required', 'string', 'exists:mite_accesses,id'],
            'date_start' => ['required', 'date'],
            'date_end' => ['required', 'date'],
            'entries' => ['required', 'array'],
            'entries.*.note' => ['nullable', 'string'],
            'entries.*.project_id' => ['nullable', 'string', 'exists:projects,id'],
            'entries.*.service_id' => ['nullable', 'string', 'exists:services,id'],
            'entries.*.minutes' => ['required', 'integer'],
            'include_weekends' => ['nullable', 'boolean'],
        ];
    }
}
