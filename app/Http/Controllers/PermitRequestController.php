<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePermitRequestRequest;
use App\Models\Employee;
use App\Models\Notification;
use App\Models\PermitRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PermitRequestController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->get('search');
        $department = $request->get('department');
        $status = $request->get('status');
        $dateFrom = $request->get('date_from');
        $dateTo = $request->get('date_to');

        $requests = PermitRequest::with(['employee', 'reviewer'])
            ->when($search, function ($query, $search) {
                return $query->whereHas('employee', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('employee_id', 'like', "%{$search}%");
                });
            })
            ->when($department, function ($query, $department) {
                return $query->whereHas('employee', function ($q) use ($department) {
                    $q->where('department', $department);
                });
            })
            ->when($status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->when($dateFrom, function ($query, $dateFrom) {
                return $query->where('start_datetime', '>=', $dateFrom);
            })
            ->when($dateTo, function ($query, $dateTo) {
                return $query->where('end_datetime', '<=', $dateTo);
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $departments = Employee::distinct()->pluck('department')->sort()->values();

        return Inertia::render('permit-requests/index', [
            'requests' => $requests,
            'departments' => $departments,
            'filters' => [
                'search' => $search,
                'department' => $department,
                'status' => $status,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('permit-requests/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePermitRequestRequest $request)
    {
        // Find employee by employee_id
        $employee = Employee::where('employee_id', $request->employee_id)->firstOrFail();
        
        // Create permit request
        $permitRequest = PermitRequest::create([
            'employee_id' => $employee->id,
            'start_datetime' => $request->start_datetime,
            'end_datetime' => $request->end_datetime,
            'vehicle_type' => $request->vehicle_type,
            'license_plate' => $request->license_plate,
        ]);

        // Send notification to HR users
        $hrUsers = User::hrUsers()->get();
        
        foreach ($hrUsers as $user) {
            Notification::create([
                'user_id' => $user->id,
                'title' => 'New Vehicle Permit Request',
                'message' => "New permit request from {$permitRequest->employee->name} ({$permitRequest->employee->department})",
                'type' => 'permit_request',
                'data' => [
                    'permit_request_id' => $permitRequest->id,
                    'employee_name' => $permitRequest->employee->name,
                    'employee_department' => $permitRequest->employee->department,
                    'vehicle_type' => $permitRequest->vehicle_type,
                ],
            ]);
        }

        return redirect()->route('permit-requests.show', $permitRequest)
            ->with('success', 'Vehicle usage permit request submitted successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(PermitRequest $permitRequest)
    {
        $permitRequest->load(['employee', 'reviewer']);

        return Inertia::render('permit-requests/show', [
            'request' => $permitRequest,
        ]);
    }

    /**
     * Update the specified resource status.
     */
    public function update(Request $request, PermitRequest $permitRequest)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
            'notes' => 'nullable|string',
        ]);

        $permitRequest->update([
            'status' => $request->status,
            'notes' => $request->notes,
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        // Employee notification placeholder - could be extended for email notifications

        return redirect()->back()
            ->with('success', 'Permit request ' . $request->status . ' successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PermitRequest $permitRequest)
    {
        $permitRequest->delete();

        return redirect()->route('permit-requests.index')
            ->with('success', 'Permit request deleted successfully.');
    }


}