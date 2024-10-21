<?php

namespace App\Http\Requests;

use App\Models\MiteAccess;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class UpdateMiteAccessRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $miteAccess = MiteAccess::find($this->id);
        return $miteAccess->user_id === Auth::id();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            "access_token" => ["required", "string", "max:255"],
            "name" => ["required", "string", "max:255"],
        ];
    }
}
