<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use Illuminate\Http\Request;

class EmployeeApiController extends Controller
{
    /**
     * Get employee details by employee ID.
     */
    public function show(Request $request)
    {
        $employeeId = $request->get('employee_id');
        
        if (!$employeeId) {
            return response()->json(['error' => 'Employee ID is required'], 400);
        }

        $employee = Employee::where('employee_id', $employeeId)->first();

        if (!$employee) {
            return response()->json(['error' => 'Employee not found'], 404);
        }

        return response()->json([
            'id' => $employee->id,
            'employee_id' => $employee->employee_id,
            'name' => $employee->name,
            'department' => $employee->department,
            'grade' => $employee->grade,
            'email' => $employee->email,
        ]);
    }
}