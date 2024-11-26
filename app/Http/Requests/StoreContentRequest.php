<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreContentRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'project_id' => ['nullable', 'exists:projects,id'],
            'service_id' => ['nullable', 'exists:services,id'],
            'minutes' => ['required', 'integer', 'min:1'],
            'start_time' => ['required', 'date_format:"H:i","H:i:s"'],
            'pause_time' => ['required', 'integer', 'min:0'],
            'jitter_minutes' => ['required', 'integer', 'min:0'],
            'jitter_increments' => ['required', 'integer', 'min:1'],
            'n_activities' => ['required', 'integer', 'min:0'],
            'template_id' => ['required', 'exists:templates,id'],
        ];
    }
}
